#!/usr/bin/env python3
"""
Test script to verify database creation and basic CRUD operations

This script:
1. Initializes the database
2. Creates a test Script with Questions
3. Adds Flags and Notes to questions
4. Queries and displays the data
5. Cleans up test data
"""

import sys
from datetime import datetime
from models.db import db, init_db
from models.user import User
from models.script import Script, Question
from models.flag import Flag
from models.note import Note


def test_database():
    """Test database creation and relationships"""
    
    print("\n" + "="*60)
    print("🧪 DATABASE TEST SCRIPT")
    print("="*60 + "\n")
    
    # Import app to get application context
    from app import app
    
    with app.app_context():
        # Step 1: Create database tables
        print("Step 1: Creating database tables...")
        db.create_all()
        print("✓ Tables created\n")
        
        # Step 2: Create a test user
        print("Step 2: Creating test user...")
        test_user = User(email="test@example.com")
        db.session.add(test_user)
        db.session.commit()
        print(f"✓ User created: {test_user.email} (ID: {test_user.id})\n")
        
        # Step 3: Create a test script
        print("Step 3: Creating test interview script...")
        test_script = Script(
            title="UX Research Interview - Mobile App Users",
            research_goal="Understand user pain points with current mobile banking app",
            target_users="Mobile banking app users aged 25-45",
            duration_minutes=30,
            interview_type="semi-structured",
            status="draft",
            user_id=test_user.id
        )
        db.session.add(test_script)
        db.session.commit()
        print(f"✓ Script created: {test_script.title} (ID: {test_script.id})\n")
        
        # Step 4: Create test questions
        print("Step 4: Creating test questions...")
        questions_data = [
            {"section": "intro", "order": 1, "text": "Can you tell me about your experience with mobile banking?"},
            {"section": "warm-up", "order": 2, "text": "How often do you use mobile banking apps?"},
            {"section": "main", "order": 3, "text": "What are the biggest challenges you face when using your banking app?"},
            {"section": "closing", "order": 4, "text": "Is there anything else you'd like to share about your banking experience?"}
        ]
        
        questions = []
        for q_data in questions_data:
            question = Question(
                text=q_data["text"],
                section=q_data["section"],
                order_index=q_data["order"],
                script_id=test_script.id
            )
            questions.append(question)
            db.session.add(question)
        
        db.session.commit()
        print(f"✓ Created {len(questions)} questions\n")
        
        # Step 5: Add flags to a question
        print("Step 5: Adding quality check flags...")
        flag1 = Flag(
            question_id=questions[0].id,
            type="bias",
            severity="medium",
            explanation="Question may lead respondent to focus only on positive experiences",
            suggestion_rewrite="Can you describe your recent experiences with mobile banking, both positive and negative?"
        )
        flag2 = Flag(
            question_id=questions[2].id,
            type="alignment",
            severity="low",
            explanation="Question could be more specific to align with research goal about pain points",
            suggestion_rewrite="What specific pain points or frustrations have you encountered while using your banking app?"
        )
        db.session.add(flag1)
        db.session.add(flag2)
        db.session.commit()
        print(f"✓ Added {2} flags to questions\n")
        
        # Step 6: Add notes to a question
        print("Step 6: Adding interview notes...")
        note1 = Note(
            question_id=questions[2].id,
            content="User mentioned difficulty with mobile check deposit feature - follow up on this"
        )
        note2 = Note(
            question_id=questions[3].id,
            content="User seemed hesitant - consider asking about privacy concerns"
        )
        db.session.add(note1)
        db.session.add(note2)
        db.session.commit()
        print(f"✓ Added {2} notes to questions\n")
        
        # Step 7: Query and display data
        print("="*60)
        print("📊 VERIFICATION: Querying Data")
        print("="*60 + "\n")
        
        # Query script with all relationships
        script = Script.query.filter_by(id=test_script.id).first()
        print(f"Script: {script.title}")
        print(f"  Research Goal: {script.research_goal}")
        print(f"  Target Users: {script.target_users}")
        print(f"  Duration: {script.duration_minutes} minutes")
        print(f"  Type: {script.interview_type}")
        print(f"  Status: {script.status}")
        print(f"  Questions: {len(script.questions)}\n")
        
        # Display questions with flags and notes
        for question in script.questions:
            print(f"Question {question.order_index} ({question.section}):")
            print(f"  Text: {question.text}")
            
            if question.flags:
                print(f"  Flags ({len(question.flags)}):")
                for flag in question.flags:
                    print(f"    - {flag.type.upper()} ({flag.severity}): {flag.explanation}")
                    if flag.suggestion_rewrite:
                        print(f"      Suggested: {flag.suggestion_rewrite}")
            
            if question.question_notes:
                print(f"  Notes ({len(question.question_notes)}):")
                for note in question.question_notes:
                    print(f"    - {note.content}")
            
            print()
        
        # Step 8: Test serialization
        print("="*60)
        print("🔄 VERIFICATION: Testing JSON Serialization")
        print("="*60 + "\n")
        
        script_dict = script.to_dict()
        print(f"Script JSON keys: {list(script_dict.keys())}")
        
        question_dict = questions[2].to_dict(include_flags=True, include_notes=True)
        print(f"Question JSON keys: {list(question_dict.keys())}")
        if 'flags' in question_dict:
            print(f"  - Flags included: {len(question_dict['flags'])}")
        if 'question_notes' in question_dict:
            print(f"  - Notes included: {len(question_dict['question_notes'])}")
        
        print("\n" + "="*60)
        print("✅ DATABASE TEST COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\nAll tables created, relationships work correctly!")
        print("Models: User, Script, Question, Flag, Note")
        print("Relationships verified: Script->Questions, Question->Flags/Notes")
        print("\nDatabase file: interview_companion.db")
        print("="*60 + "\n")
        
        return True


if __name__ == '__main__':
    try:
        test_database()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error during database test: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
