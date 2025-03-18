from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import engine, get_db
from app.models import user
from app.schemas.user import UserCreate, User
from passlib.context import CryptContext
from datetime import datetime

# Create database tables
user.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Healthcare System API")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

@app.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    print("Received user_data:", user_data)  # Log the input
    # Check if email already exists
    db_user = db.query(user.User).filter(user.User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    db_user = db.query(user.User).filter(user.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user instance
    hashed_password = get_password_hash(user_data.password)
    db_user = user.User(
        email=user_data.email,
        username=user_data.username,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        date_of_birth=user_data.date_of_birth,
        hashed_password=hashed_password,
        role=user_data.role
    )
    
    # Add user to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # If user is a doctor, create doctor profile
    if user_data.role == "doctor":
        # At this point, doctor_profile should exist due to the validation in the schema
        db_doctor = user.DoctorProfile(
            user_id=db_user.id,
            doctor_id=user_data.doctor_profile.doctor_id,
            specialization=user_data.doctor_profile.specialization,
            years_of_experience=user_data.doctor_profile.years_of_experience
        )
        db.add(db_doctor)
        db.commit()
        db.refresh(db_user)
    
    return db_user

@app.get("/")
def read_root():
    return {"message": "Welcome to Healthcare System API"}