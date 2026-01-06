# Flag model for script quality checks
# Flags indicate potential issues with interview questions (bias, alignment, etc.)

from models.db import db
from datetime import datetime


class Flag(db.Model):
    """
    Flag model for quality checks on interview questions
    Tracks bias/leading language and alignment issues
    """
    
    __tablename__ = 'flags'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key to question
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    
    # Flag type: 'bias' or 'alignment'
    type = db.Column(db.String(50), nullable=False)  # bias, alignment
    
    # Severity level: 'low', 'medium', 'high'
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high
    
    # Explanation of the issue
    explanation = db.Column(db.Text, nullable=False)
    
    # Suggested rewrite to fix the issue
    suggestion_rewrite = db.Column(db.Text, nullable=True)
    
    # Timestamp
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Flag {self.type} - {self.severity} for Question {self.question_id}>'
    
    def to_dict(self):
        """Convert flag to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'question_id': self.question_id,
            'type': self.type,
            'severity': self.severity,
            'explanation': self.explanation,
            'suggestion_rewrite': self.suggestion_rewrite,
            'created_at': self.created_at.isoformat()
        }
