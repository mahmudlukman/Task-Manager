// import swaggerAutogen from 'swagger-autogen';
const swaggerAutogen = require('swagger-autogen')()



const doc = {
  info: {
    title: 'Task Manager API',
    description: 'API documentation for the Task Management System',
    version: '1.0.0',
  },
  host: 'localhost:8000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./dist/routes/auth.route.js', './dist/routes/task.route.js', './dist/routes/user.route.js', './dist/routes/report.route.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
