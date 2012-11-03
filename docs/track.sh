

while inotifywait -qre close_write . 
do
	make html
done
