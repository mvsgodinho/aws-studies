/* eslint-disable no-unused-vars */
const Service = require('./Service');
const Mocks = require('../mocks');

/**
* Add a new product to the store
*
* product Product Product object that needs to be added to the store
* no response value expected for this operation
* */
const addProduct = ({ product }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        product,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Finds Products
* Multiple status values can be provided with comma separated strings
*
* status List Status filter (optional)
* returns List
* */
const findProductsByStatus = ({ status }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse(Mocks.productsFindAll));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  addProduct,
  findProductsByStatus,
};
