require('dotenv').config();
let request = require('request')
let base_url = 'https://devlab.formelo.com/api/'


let username = process.env.USER_NAME;
let password = process.env.PASSWORD;


// forms and new collections id
let form_and_corr_col_ids = {
  student_register_form: {
   form_id: '1r0mpvly',
   col_id: 'new collection id', // The id of the new collection that was created.
  },
  faq_navigator_form: {
    form_id: 'vr5mq0j1',
    col_id: 'new collection id', // The id of the new collection that was created.
   },
}

for (let item in form_and_corr_col_ids) {
  // get existing form by id

  let options = {
    url: `${base_url}applets/${form_and_corr_col_ids[item].form_id}`,
    auth: {
      user: username,
      pass: password,
    },
  }

  const getExistingForm = (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let newObj = {}
      const main_res = JSON.parse(body)
      delete main_res.id
      delete main_res.uuid
      delete main_res.reference_code

      main_res.collection.id = form_and_corr_col_ids[item].col_id
      main_res.name = `Test ${main_res.name}`

      // get attributes from collection
      let options = {
        url: `${base_url}attributes?collection.id=${form_and_corr_col_ids[item].col_id}&pagesize=1000`,
        auth: {
          user: username,
          pass: password,
        },
      }

      const getCollectionAttributes = (error, response, body) => {
        if (!error && response.statusCode == 200) {
          let res = JSON.parse(body)
          let attrMap = {}
          for (let p = 0; p < res.length; p++) {
            let singleAttr = res[p].key
            if (attrMap) {
              attrMap[singleAttr] = res[p]
              for (let i = 0; i < main_res.pages.length; i++) {
                let page = main_res.pages[i]
                for (let j = 0; j < page.fieldsets.length; j++) {
                  let fieldset = page.fieldsets[j]
                  for (let k = 0; k < fieldset.fields.length; k++) {
                    let field = fieldset.fields[k]
                    if (field.key === Object.keys(attrMap)[p]) {
                      field.attribute = attrMap[field.key]
                      newObj = main_res
                    }
                  }
                }
              }
            }
          }
        }
      }
      request(options, getCollectionAttributes)

      setTimeout(() => {
        let headers = {
          'Content-Type': 'application/json',
        }

        let dataString = JSON.stringify(newObj)

        let options = {
          url: `${base_url}applets`,
          method: 'POST',
          headers: headers,
          body: dataString,
          auth: {
            user: username,
            pass: password,
          },
        }

        function createFormWithNewAttributes(error, response, body) {
          if (!error && response.statusCode == 201) {
            console.log('form created successfully')
          }
        }

        request(options, createFormWithNewAttributes)
      }, 10000)
    }
  }

  request(options, getExistingForm)
}
