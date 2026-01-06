# Database configuration and initialization
# This file sets up SQLAlchemy for the Flask application

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Create base class for models
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy with custom base class
db = SQLAlchemy(model_class=Base)


def init_app(app):
    """
    Initialize the database with the Flask app
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    
    with app.app_context():
        # Import all models here so they are registered with SQLAlchemy
        from models import script, user  # Import model files when created
        
        print("✓ Database initialized successfully")


def init_db():
    """
    Initialize the database by creating all tables
    This should be called from a CLI script or initialization routine
    """
    from app import app
    
    with app.app_context():
        # Import all models
        from models import script, user  # Import model files when created
        
        # Create all tables
        db.create_all()
        
        print("\n" + "="*50)
        print("✓ Database tables created successfully!")
        print("="*50)
        print("\nTables created:")
        print("  - users")
        print("  - scripts")
        print("  - questions")
        print("="*50 + "\n")


def reset_db():
    """
    Drop all tables and recreate them
    WARNING: This will delete all data!
    """
    from app import app
    
    with app.app_context():
        print("\n⚠️  WARNING: This will delete all data!")
        confirm = input("Are you sure you want to reset the database? (yes/no): ")
        
        if confirm.lower() == 'yes':
            db.drop_all()
            print("✓ All tables dropped")
            
            db.create_all()
            print("✓ All tables recreated")
            print("\n Database reset complete!\n")
        else:
            print("Database reset cancelled.")
