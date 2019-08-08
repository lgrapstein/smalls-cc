var express = require('express');
var router = express.Router();
var axios = require('axios')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:resource/:resourceId?', async (req, res) => {

  const { resource, resourceId } = req.params;

  try {
    let response = await axios.get(`https://swapi.co/api/${ resource }${ resourceId ? '/'+resourceId : '' }`)

    let removedArrData = {}

    let arrayList = []

    // index page (i.e., /people)
    if (!resourceId) {
      showOrIndex = response.data.results

      for (let i = 0; i < showOrIndex.length; i++) {

        Object.entries(showOrIndex[i]).forEach(
          ([key, value]) => {
            if (Array.isArray(value)) {
              showOrIndex.map(s => {
                let id = s.url.split('/')[5]
                arrayList.push({
                  type: key,
                  id,
                  links: { self: `https://swapi.co/api/${key}/${id}/` }
                })
              })
            } else {
              removedArrData[key] = value
            }
          }
        )
      }
      return res.json({
        data: removedArrData,
        included: arrayList.length > 1 ? arrayList : [...arrayList]
      });
    } else {
      // show page (i.e., /people/1)
      showOrIndex = response.data

      Object.entries(showOrIndex).forEach(
        ([key, value]) => {
          if (Array.isArray(value)) {
            arrayList.push(value)
          } else {
            removedArrData[key] = value
          }
        }
      );

      arrayList = arrayList.flat(1)

      let arr = []
      let jsonObj

      for (let i = 0; i < arrayList.length; i++) {
        jsonObj = {
          type: arrayList[i].split('/')[4],
          id: arrayList[i].split('/')[5],
          links: { self: arrayList[i] }
        }
        arr.push(jsonObj)
      }

      return res.json({
        data: removedArrData,
        included: arr.length > 1 ? arr : [...arr]
      })
    }

  } catch(err) {
    res.status(500).json({ err });
  }
});

module.exports = router;
