#!/bin/bash

version="0.1.0"

showHelp() {
    # clear
    echo "HeyHolis $version"
    echo
    echo "Usage: $0 [option]"
    echo
    echo 'Option:'
    echo '  -h | --help            This help file'
    echo '  -r | --replicate       Replicates projet'
    echo '  -d | --deploy          Copies ./dist folder to wherever you want'
    # echo '  -w | --whatever        does whatever'
    echo
}

# https://linuxacademy.com/blog/linux/conditions-in-bash-scripting-if-statements/
if [[ $1 == "" ]]
then
    showHelp
else
    for i in "$@"
    do
        case $i in

            -h|--help)
                showHelp
                exit
                ;;

            -r|--replicate)
                if [ -z "$1" ]||[ -z "$2" ]
                then
                    echo " usage:"
                    echo " heyholis.sh -r destinationfolder"
                    exit 1
                else
                    rsync -zvrh --exclude-from=".gitignore" --exclude=".git" . "${2%%}"
                fi
                exit
                ;;

            -d|--deploy )
                exit
                ;;

            *)
                # unknown option
                showHelp
                exit 1
            ;;
        esac
    done
fi
