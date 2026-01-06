# Note model for interview notes
# Notes are added to questions during live interview mode

from models.db import db
from datetime import datetime


class Note(db.Model):
    """
    Note model for interview question notes
    Used during live interview mode to capture insights and observations
    """
    
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key to question
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    
    # Note content
    content = db.Column(db.Text, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Note for Question {self.question_id}>'
    
    def to_dict(self):
        """Convert note to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
