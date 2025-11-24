import sqlite3
import csv
import io
from flask import Flask, render_template, request, jsonify, Response, session, redirect, url_for
from functools import wraps

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Change this in production

DATABASE = 'registrations.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS registrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                ticket_type TEXT NOT NULL,
                dietary_restrictions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()

# Admin authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    try:
        db = get_db()
        db.execute('INSERT INTO registrations (name, email, phone, ticket_type, dietary_restrictions) VALUES (?, ?, ?, ?, ?)',
                   (data['name'], data['email'], data['phone'], data['ticket_type'], data.get('dietary_restrictions', '')))
        db.commit()
        return jsonify({'success': True, 'message': 'Registration successful!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # Hardcoded password for demo purposes
    if data.get('password') == 'admin123':
        session['logged_in'] = True
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Invalid password'}), 401

@app.route('/admin')
@login_required
def admin():
    db = get_db()
    registrations = db.execute('SELECT * FROM registrations ORDER BY created_at DESC').fetchall()
    return render_template('admin.html', registrations=registrations)

@app.route('/api/export-csv')
@login_required
def export_csv():
    db = get_db()
    registrations = db.execute('SELECT * FROM registrations ORDER BY created_at DESC').fetchall()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['ID', 'Name', 'Email', 'Phone', 'Ticket Type', 'Dietary Restrictions', 'Created At'])
    
    # Write data
    for reg in registrations:
        writer.writerow([reg['id'], reg['name'], reg['email'], reg['phone'], reg['ticket_type'], reg['dietary_restrictions'], reg['created_at']])
        
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=registrations.csv"}
    )

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=3000)
