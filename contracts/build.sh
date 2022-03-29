#!/bin/bash
set -e

IS_COMPILE=false
IS_RESET_PROFILE=false
IS_DEPLOY=false
IS_COMPILE_DEPLOY=false

for var in "$@"
do
  case $var in
    -h|--help)
     echo "Utility script to help you compile, reset profile and deploy contracts on the NEAR blockchain"
     echo "Available options:"
     echo "| "
     echo "| --help | -h: Show this help message."
     echo "| "
     echo "| --compile | -c: Compile the contracts for release with: RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release"
     echo "| "
     echo "| --reset | -r: Resets the dev account id by deleting the .neardev folder, you must deploy to generate a new profile/account."
     echo "| "
     echo "| --deploy | -d: Deploys the contracts to the NEAR network with: near dev-deploy --wasmFile ./out/main.wasm"
     echo "| "
     echo " "
     echo "For more information please check the docs: https://docs.near.org/docs/develop/basics/getting-started"
     echo " "
     echo "Author:"
     echo "| Joaquim Ley <joaquimley@gmail.com> joaquimley.near | Jan 2022"
     echo "| Based on 'NEAR examples' build script available on GitHub: https://github.com/near-examples/NFT/blob/master/build.sh"
     echo " "
     echo "Issues: "
     ;;
     
    -cd)
      IS_COMPILE_DEPLOY=true
      ;;
    -d|--deploy)
      IS_DEPLOY=true
      ;;
    -r|--reset) 
      IS_RESET_PROFILE=true
      ;;
    -c|--compile)
      IS_COMPILE=true
      ;;
  esac
done

if $IS_COMPILE ; then
    echo "Compiling for release... 🤖"
    RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
    mkdir -p ./out
    cp target/wasm32-unknown-unknown/release/*.wasm ./out/main.wasm
    echo "---------------------------------------------------------"
    echo "Compile success! ⭐ Artifact exported to: ./out/main.wasm"
fi

if $IS_RESET_PROFILE; then
    echo "Reseting the neardev profile"
    rm -rf ./neardev
    echo "---------------------------------------------------------"
    echo ".neardev folder deleted 🗑, compile to generate a new dev-account"
fi

if $IS_DEPLOY; then
    echo "Deploying contract... ⛓️"
    near dev-deploy --wasmFile ./out/main.wasm
    echo "---------------------------------------------------------"
    echo "Contract deployed with success ✅" 

    echo "---------------------------------------------------------"
    echo "Load the new contract account id with:"
    echo "> source ./neardev/dev-account.env"
fi
if $IS_COMPILE_DEPLOY; then
echo "Compiling for release... 🤖"
    RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
    mkdir -p ./out
    cp target/wasm32-unknown-unknown/release/*.wasm ./out/main.wasm
    echo "---------------------------------------------------------"
    echo "Compile success! ⭐ Artifact exported to: ./out/main.wasm"
    echo "Deploying contract... ⛓️"
    near dev-deploy --wasmFile ./out/main.wasm
    echo "---------------------------------------------------------"
    echo "Contract deployed with success ✅" 

    echo "---------------------------------------------------------"
    echo "Load the new contract account id with:"
    echo "> source ./neardev/dev-account.env"
fi