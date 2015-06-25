MyCloud
=======

Personal Cloud Storage. Your own cloud with **absolutely zero censorship**.

## Deployment

1. Install requirements

  * Linux/Unix
  * Python 2.7
  * pip
  * react-tools
 
 
  To install required packages: 
  
        pip install -r requirements.txt

2. Setup Database

        python model.py
        
3. Run

		# Start jsx watching
		cd static/js
		./start_jsx_watch.sh
		
		# Start app
		cd ../..
		python app.py
    

Go to `localhost:5000` and that's it!
