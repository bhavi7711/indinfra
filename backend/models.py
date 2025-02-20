import os
import sqlite3

DB_NAME = "annotations.db"

# ✅ Create the database and annotations table if not exists
def initialize_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS annotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pdf_name TEXT NOT NULL,
            annotation TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# ✅ Save annotation to the database
def save_annotation(pdf_name, annotation):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO annotations (pdf_name, annotation) VALUES (?, ?)", (pdf_name, annotation))
    conn.commit()
    conn.close()

# ✅ Retrieve annotations for a specific PDF
def get_annotations(pdf_name):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT annotation FROM annotations WHERE pdf_name = ?", (pdf_name,))
    annotations = [row[0] for row in cursor.fetchall()]
    conn.close()
    return annotations
