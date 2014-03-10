test:
	npm --silent test

test-browser:
	mkdir -p test-browser
	node_modules/.bin/browserify -t brfs test/index.js > test-browser/bundle.js
	printf '\
<!doctype html>\n\
<html>\n\
<head>\n\
		<meta charset="utf8">\n\
		<title>test</title>\n\
</head>\n\
<body>\n\
		<script src="bundle.js"></script>\n\
</body>\n\
</html>' > test-browser/index.html

cover:
	npm --silent run cover

example:
	node_modules/.bin/browserify -t brfs example/index.js -o example/bundle.js
	node_modules/.bin/stylus < example/index.styl > example/bundle.css

.PHONY: test cover example test-browser
