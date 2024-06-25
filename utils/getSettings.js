const { Setting } = require('../controllers/setting-controller');

const getSettings = async () => {

    let setting = await Setting.find();
    return setting[0]
}

module.exports = { getSettings }