if [ ! -d "build" ]; then
        mkdir build
fi
jsx --extension jsx --watch src/ build/
