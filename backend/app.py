from flask import Flask, jsonify
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

app = Flask(__name__)

# MongoDB connection
DB_URL = os.getenv('DB_URL')
DB_NAME = "Kleo"

client = MongoClient(DB_URL)
db = client[DB_NAME]

@app.route('/user-count', methods=['GET'])
def get_user_count():
    try:
        # Get the count of documents in the 'users' collection
        user_count = db.users.count_documents({})
        
        return jsonify({'user_count': user_count}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/doa-users', methods=['GET'])
def get_inactive_users():
    try:
        # Find users with no published cards and no pending cards
        inactive_users = db.users.aggregate([
            {
                '$lookup': {
                    'from': 'published_cards',
                    'localField': 'slug',
                    'foreignField': 'slug',
                    'as': 'published_cards'
                }
            },
            {
                '$lookup': {
                    'from': 'pending_cards',
                    'localField': 'slug',
                    'foreignField': 'slug',
                    'as': 'pending_cards'
                }
            },
            {
                '$match': {
                    'published_cards': {'$size': 0},
                    'pending_cards': {'$size': 0}
                }
            },
            {
                '$lookup': {
                    'from': 'history',
                    'localField': 'slug',
                    'foreignField': 'slug',
                    'as': 'history_items'
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'user': '$slug',
                    'history_count': {'$size': '$history_items'}
                }
            }
        ])

        inactive_users_list = list(inactive_users)
        total_inactive_users = len(inactive_users_list)

        user_history_counts = [{'user': user['user'], 'history_count': user['history_count']} for user in inactive_users_list]

        return jsonify({
            'total_inactive_users': total_inactive_users,
            'user_history_counts': user_history_counts
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users-with-old-published-cards', methods=['GET'])
def get_users_with_old_published_cards():
    try:
        # Calculate the timestamp 24 hours ago
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        
        # Find users with zero pending cards and last published card older than 24 hours
        users_with_old_published_cards = db.users.aggregate([
            {
                '$lookup': {
                    'from': 'pending_cards',
                    'localField': 'slug',
                    'foreignField': 'slug',
                    'as': 'pending_cards'
                }
            },
            {
                '$lookup': {
                    'from': 'published_cards',
                    'localField': 'slug',
                    'foreignField': 'slug',
                    'as': 'published_cards'
                }
            },
            {
                '$match': {
                    'pending_cards': {'$size': 0},
                    'published_cards.timestamp': {'$lt': twenty_four_hours_ago.timestamp()}
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'user': '$slug',
                    'last_published_at': {
                        '$max': '$published_cards.timestamp'
                    }
                }
            }
        ])

        users_list = list(users_with_old_published_cards)

        return jsonify(users_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run()