#!/bin/bash

cd backend
yarn db:migrate
yarn install
yarn start
