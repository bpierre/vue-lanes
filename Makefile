test:
	npm --silent test

example:
	node_modules/.bin/browserify -t brfs example/index.js -o example/bundle.js
	node_modules/.bin/stylus < example/index.styl > example/bundle.css

.PHONY: test cover example
