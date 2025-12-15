■dockerコンテナ
docker exec -it postgres_db sh
psql -U postgres -d appdb
\dt;