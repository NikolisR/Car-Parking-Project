import psycopg2

from backend.config import DATABASE_CONFIG


def connect_to_db():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        return conn
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        exit(0)

def update_parking_status(cur, spot, is_occupied, timestamp):
    cur.execute("""
        INSERT INTO parking_spots (SpotName, doyouexisthere, givememytime)
        VALUES (%s, %s, %s)
        ON CONFLICT (SpotName)
        DO UPDATE SET doyouexisthere = EXCLUDED.doyouexisthere, givememytime = EXCLUDED.givememytime;
    """, (spot, not is_occupied, timestamp))