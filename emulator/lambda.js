import {renderVTL} from './src/engine.js';

export const handler = async (event) => {
  try {
    const {template, context} = JSON.parse(event.body || '{}');

    if (!template) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'Missing "template" in request body.'}),
      };
    }

    const rendered = renderVTL(template, context || {});
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({result: rendered}),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message}),
    };
  }
};
