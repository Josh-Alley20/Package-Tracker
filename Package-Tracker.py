import requests
import json
import time


# Function to display shipment details
def display_shipment_details(shipments):
    for idx, shipment in enumerate(shipments, start=1):
        print(f"\nShipment #{idx}:")
        print(f"  Tracking ID: {shipment.get('trackingId', 'N/A')}")
        print(f"  Origin: {shipment.get('origin', 'Unknown')}")
        print(f"  Destination: {shipment.get('destination', 'Unknown')}")
        print(f"  Status: {shipment.get('status', 'Unknown')}")
        print(f"  Last Known Location: {shipment.get('lastState', {}).get('location', 'N/A')}")
        print(f"  Last Update: {shipment.get('lastState', {}).get('date', 'N/A')}")

        # Handle carrier field safely
        carrier = shipment.get('carrier', {})
        if isinstance(carrier, dict):
            carrier_name = carrier.get('name', 'Unknown')
        else:
            carrier_name = str(carrier)  # If it's an integer, convert to string
        print(f"  Current Carrier: {carrier_name}")

        # List tracking updates (states)
        print("\n  Tracking Updates:")
        states = shipment.get('states', [])
        if states:
            for state in states:
                print(
                    f"    - [{state.get('date', 'N/A')}] {state.get('status', 'Unknown')} @ {state.get('location', 'Unknown')}")
        else:
            print("    No updates available.")


# API Key and request details
apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1YTA0OGZhMC1iNDI2LTExZWYtYmY4Ny1hNzVhMDRjYzU5MzUiLCJzdWJJZCI6IjY3NTM4MmQ0Y2JmZmM3Njg1MWM3ZjU5MCIsImlhdCI6MTczMzUyNjIyOH0.KrYGim89rBlCWjsJ6FZEINH01I56H6K5vT6Nam1t0cA'
trackingUrl = 'https://parcelsapp.com/api/v3/shipments/tracking'
shipments = [
    {'trackingId': 'UJ841593631YP', 'language': 'en', 'country': 'United States'},
]

# Initiate tracking request
response = requests.post(trackingUrl, json={'apiKey': apiKey, 'shipments': shipments})

if response.status_code == 200:
    data = response.json()
    # Check if the response contains shipment data
    if 'shipments' in data:
        display_shipment_details(data['shipments'])
    else:
        print("No shipment details found in the response.")
else:
    print('Error initiating tracking request:', response.status_code, response.text)
