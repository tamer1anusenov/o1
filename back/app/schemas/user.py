from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import date

class DoctorProfileBase(BaseModel):
    doctor_id: str
    specialization: str
    years_of_experience: int

    @validator('years_of_experience')
    def validate_experience(cls, v):
        if v < 0:
            raise ValueError('Years of experience cannot be negative')
        return v

class DoctorProfileCreate(DoctorProfileBase):
    pass

class DoctorProfile(DoctorProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
        orm_mode = True  # Include this for backward compatibility

class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone_number: str
    date_of_birth: date
    role: str

    @validator('role')
    def validate_role(cls, v):
        if v not in ['patient', 'doctor']:
            raise ValueError('Role must be either "patient" or "doctor"')
        return v

    @validator('phone_number')
    def validate_phone(cls, v):
        if not v.replace('+', '').isdigit() or len(v.replace('+', '')) < 9:
            raise ValueError('Invalid phone number format')
        return v

class UserCreate(UserBase):
    password: str
    confirm_password: str
    doctor_profile: Optional[DoctorProfileCreate] = None

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

@validator('doctor_profile')
def validate_doctor_profile(cls, v, values):
    print("Validator - Role:", values.get("role"))
    print("Validator - Doctor Profile:", v)
    if 'role' in values and values['role'] == 'doctor' and not v:
        raise ValueError('Doctor profile is required for doctor role')
    if 'role' in values and values['role'] == 'patient' and v:
        raise ValueError('Doctor profile should not be provided for patient role')
    return v

    # @validator('doctor_profile')
    # def validate_doctor_profile(cls, v, values):
    #     if 'role' in values and values['role'] == 'doctor' and not v:
    #         raise ValueError('Doctor profile is required for doctor role')
    #     if 'role' in values and values['role'] == 'patient' and v:
    #         raise ValueError('Doctor profile should not be provided for patient role')
    #     return v

class User(UserBase):
    id: int
    is_active: bool
    doctor_profile: Optional[DoctorProfile] = None

    class Config:
        from_attributes = True
        orm_mode = True  # Include this for backward compatibility