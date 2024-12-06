from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# API Key and request details
apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1YTA0OGZhMC1iNDI2LTExZWYtYmY4Ny1hNzVhMDRjYzU5MzUiLCJzdWJJZCI6IjY3NTM4MmQ0Y2JmZmM3Njg1MWM3ZjU5MCIsImlhdCI6MTczMzUyNjIyOH0.KrYGim89rBlCWjsJ6FZEINH01I56H6K5vT6Nam1t0cA'
trackingUrl = 'https://parcelsapp.com/api/v3/shipments/tracking'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/track', methods=['POST'])
def track():
    tracking_ids = request.json.get('trackingIds', [])
    shipments = [{'trackingId': tid, 'language': 'en', 'country': 'United States'} for tid in tracking_ids]

    response = requests.post(trackingUrl, json={'apiKey': apiKey, 'shipments': shipments})
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Failed to fetch tracking details'}), 500


if __name__ == '__main__':
    app.run(debug=True)
