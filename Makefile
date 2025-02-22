check-code:
	yarn build
	yarn eslint-check
	yarn prettier-check

test:
	yarn test

codegen:
	apollo client:codegen --endpoint http://127.0.0.1:4000/graphql \
		--target typescript \
		--globalTypesFile=app/__generated__/globalTypes.ts \
		-c ./apollo.client.js \
		--watch
