from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, Department, LoginAttempt

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description']

        
class UserSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
          'id','email','username','first_name','last_name',
          'role','department','department_id','phone_number',
          'is_active','created_at','last_login'
        ]
        extra_kwargs = {
          'phone_number': {'required': False, 'allow_blank': True},
          'password':     {'write_only': True}
        }

    def create(self, validated_data):
        department_id = validated_data.pop('department_id', None)
        password = validated_data.pop('password', None)
        
        user = User(**validated_data)
        
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
                user.department = department
            except Department.DoesNotExist:
                raise serializers.ValidationError({'department_id': 'Department not found'})
        
        if password:
            user.set_password(password)
        
        user.save()
        return user

    def update(self, instance, validated_data):
        department_id = validated_data.pop('department_id', None)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
                instance.department = department
            except Department.DoesNotExist:
                raise serializers.ValidationError({'department_id': 'Department not found'})
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email        = serializers.EmailField(required=False)
    phone_number = serializers.CharField(required=False, allow_blank=False)
    password     = serializers.CharField(style={'input_type':'password'},
                                         trim_whitespace=False)

    def validate(self, attrs):
        identifier = attrs.get('email') or attrs.get('phone_number')
        password   = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError(
              'Please provide email or phone number, and password.'
            )

        user = authenticate(
            request=self.context.get('request'),
            username=identifier, password=password
        )
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled')

        # update last_login…
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        attrs['user'] = user
        return attrs


class LoginAttemptSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = LoginAttempt
        fields = ['id', 'username', 'ip_address', 'user_agent', 'success', 'timestamp']
    
    def get_username(self, obj):
        return obj.user.username if obj.user else "Unknown"