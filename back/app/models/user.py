from sqlalchemy import Boolean, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(255), unique=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone_number = Column(String(20))
    date_of_birth = Column(Date)
    hashed_password = Column(String(255))
    role = Column(String(20))  # "patient" or "doctor"
    is_active = Column(Boolean, default=True)
    
    # Relationship with doctor profile if role is doctor
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    doctor_id = Column(String(50), unique=True, index=True)
    specialization = Column(String(100))
    years_of_experience = Column(Integer)
    
    # Relationship with user
    user = relationship("User", back_populates="doctor_profile") 