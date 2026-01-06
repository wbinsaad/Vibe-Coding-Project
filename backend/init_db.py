#!/usr/bin/env python3
"""
Database Initialization CLI Script

This script provides commands to:
- Initialize the database (create tables)
- Reset the database (drop and recreate all tables)

Usage:
    python init_db.py              # Initialize database
    python init_db.py --reset      # Reset database (WARNING: deletes all data)
"""

import sys
import argparse
from models import init_db, reset_db


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Database initialization tool for Interview Companion',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python init_db.py              Initialize database (create tables)
  python init_db.py --reset      Reset database (drop and recreate)
        """
    )
    
    parser.add_argument(
        '--reset',
        action='store_true',
        help='Reset database (drop all tables and recreate)'
    )
    
    args = parser.parse_args()
    
    try:
        if args.reset:
            print("\n🔄 Resetting database...")
            reset_db()
        else:
            print("\n🚀 Initializing database...")
            init_db()
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
