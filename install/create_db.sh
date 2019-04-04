#!/bin/bash

sudo -u postgres \
	psql \
		-h /var/run/postgresql/ \
		-d postgres \
		-U postgres \
		< ./dec112.sql

