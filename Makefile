.PHONY: serve

serve:
	python -m SimpleHTTPServer 8002

simulate:
	ngrok http 8002
