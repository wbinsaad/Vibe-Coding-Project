# Script and Question models
# These models store interview scripts and their questions

from models.db import db
from datetime import datetime


class Script(db.Model):
    """Interview script model"""
    
    __tablename__ = 'scripts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    research_goal = db.Column(db.Text, nullable=False)
    target_users = db.Column(db.String(200), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    interview_type = db.Column(db.String(50), nullable=False)  # 'structured' or 'semi-structured'
    status = db.Column(db.String(50), nullable=False, default='draft')  # draft, ready, completed
    
    # Foreign key
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to questions
    questions = db.relationship('Question', backref='script', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Script {self.title}>'
    
    def to_dict(self):
        """Convert script to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'research_goal': self.research_goal,
            'target_users': self.target_users,
            'duration_minutes': self.duration_minutes,
            'interview_type': self.interview_type,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'questions': [q.to_dict() for q in self.questions]
        }


class Question(db.Model):
    """Interview question model"""
    
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    section = db.Column(db.String(50), nullable=False)  # intro, warm-up, main, closing
    order_index = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text, nullable=True)  # Legacy notes field (deprecated, use Note model)
    is_asked = db.Column(db.Boolean, default=False)
    
    # Foreign key
    script_id = db.Column(db.Integer, db.ForeignKey('scripts.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships to flags and notes
    flags = db.relationship('Flag', backref='question', lazy=True, cascade='all, delete-orphan')
    question_notes = db.relationship('Note', backref='question', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Question {self.section} - {self.order_index}>'
    
    def to_dict(self, include_flags=False, include_notes=False):
        """Convert question to dictionary for JSON serialization"""
        result = {
            'id': self.id,
            'text': self.text,
            'section': self.section,
            'order_index': self.order_index,
            'notes': self.notes,
            'is_asked': self.is_asked,
            'script_id': self.script_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        # Optionally include flags and notes
        if include_flags:
            result['flags'] = [f.to_dict() for f in self.flags]
        if include_notes:
            result['question_notes'] = [n.to_dict() for n in self.question_notes]
        
        return result
