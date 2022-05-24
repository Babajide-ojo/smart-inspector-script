require('dotenv').config()
let request = require('request')
let base_url = 'https://devlab.formelo.com/api/'

let username = process.env.USER_NAME
let password = process.env.PASSWORD

console.log('processing request...')

// forms and new collections id
let form_and_corr_col_ids = {
  student_register_form: {
    form_id: 'vr5mq0j1',
    col_id: 'djx1e0rp'
  }
}
for (let item in form_and_corr_col_ids) {
  let options = {
    url: `${base_url}collections/${form_and_corr_col_ids[item].col_id}`,
    auth: {
      user: username,
      pass: password,
    },
  }
  //get existing collection by id
  const getExistingCollection = (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const res = JSON.parse(body)
      res.slug = `test_${res.slug}`
      let newSlug = res.slug
      delete res.id
      delete res.uuid

      //checks if slug exists
      let options = {
        url: `${base_url}collections?pagesize=1000`,
        auth: {
          user: username,
          pass: password,
        },
      }
      const checkIfSlugExists = (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const all_collections = JSON.parse(body)
          for (j = 0; j < all_collections.length; j++) {
            if (all_collections[j].slug === newSlug) {
              console.log(' ')
              console.log('===============================')
              console.log(
                `collection id = ${form_and_corr_col_ids[item].col_id} : slug name already exists for collection with id ${all_collections[j].id}`,
              )
              console.log('===============================')
              console.log(' ')

              // get existing collection by newSlug
              var options = {
                url: `${base_url}collections?slug=${newSlug}`,
                auth: {
                  user: username,
                  pass: password,
                },
              }

              function getCollectionIdBySlug(error, response, body) {
                if (!error && response.statusCode == 200) {
                  const res = JSON.parse(body)
                  this_col_id = res[0].id
          

                
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

                      main_res.collection.id =
                        form_and_corr_col_ids[item].col_id
                      main_res.name = `Test ${main_res.name}`
      
                      let options = {
                        url: `${base_url}attributes?collection.id=${form_and_corr_col_ids[item].col_id}&pagesize=1000`,
                        auth: {
                          user: username,
                          pass: password,
                        },
                      }

                      const getCollectionAttributes = (
                        error,
                        response,
                        body,
                      ) => {
                        if (!error && response.statusCode == 200) {
                          let res = JSON.parse(body)
                          let attrMap = {}
                          for (let p = 0; p < res.length; p++) {
                            let singleAttr = res[p].key
                            if (attrMap) {
                              attrMap[singleAttr] = res[p]
                              for (let i = 0; i < main_res.pages.length; i++) {
                                let page = main_res.pages[i]
                                for (
                                  let j = 0;
                                  j < page.fieldsets.length;
                                  j++
                                ) {
                                  let fieldset = page.fieldsets[j]
                                  for (
                                    let k = 0;
                                    k < fieldset.fields.length;
                                    k++
                                  ) {
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

                        function createFormWithNewAttributes(
                          error,
                          response,
                          body,
                        ) {
                          if (!error && response.statusCode == 201) {
                            console.log('Form created successfully from existing collection')
                          }
                        }

                        request(options, createFormWithNewAttributes)
                      }, 10000)
                    }
                  }

                  request(options, getExistingForm)
                }
              }

              request(options, getCollectionIdBySlug)
            } else 
            
            {
              // create new collection
              let headers = {
                'Content-Type': 'application/json',
              }

              let dataString = JSON.stringify(res)

              let options = {
                url: `${base_url}collections`,
                method: 'POST',
                headers: headers,
                body: dataString,
                auth: {
                  user: username,
                  pass: password,
                },
              }

              const createNewCollection = (error, response, body) => {
                if (!error && response.statusCode == 201) {
                  // get new collection by slug
                  let options = {
                    url: `${base_url}collections?slug=${newSlug}`,
                    auth: {
                      user: username,
                      pass: password,
                    },
                  }

                  const getNewCollectionBySlug = (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                      const res = JSON.parse(body)

                      let new_collection_id = res[0].id

                      // get attributes from existing collection
                      let options = {
                        url: `${base_url}attributes?collection.id=${form_and_corr_col_ids[item].col_id}&pagesize=1000`,
                        auth: {
                          user: username,
                          pass: password,
                        },
                      }

                      const getExistingAttributes = (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                          const res = JSON.parse(body)

                          for (let i = 0; i < res.length; i++) {
                            let singleAttr = res[i]
                            delete singleAttr.id
                            delete singleAttr.uuid

                            singleAttr.collection.id = new_collection_id

                            // create new attributes for the new collection

                            let headers = {
                              'Content-Type': 'application/json',
                            }

                            let dataString = JSON.stringify(singleAttr)

                            let options = {
                              url: `${base_url}attributes`,
                              method: 'POST',
                              headers: headers,
                              body: dataString,
                              auth: {
                                user: username,
                                pass: password,
                              },
                            }

                            const createNewAttributes = (
                              error,
                              response,
                              body,
                            ) => {
                              if (!error && response.statusCode == 201) {
                                if (res.length - i === i) {
                            

                                  let options = {
                                    url: `${base_url}applets/${form_and_corr_col_ids[item].form_id}`,
                                    auth: {
                                      user: username,
                                      pass: password,
                                    },
                                  }

                                  const getExistingForm = (
                                    error,
                                    response,
                                    body,
                                  ) => {
                                    if (!error && response.statusCode == 200) {
                                      let newObj = {}
                                      const main_res = JSON.parse(body)
                                      delete main_res.id
                                      delete main_res.uuid
                                      delete main_res.reference_code

                                      main_res.collection.id =
                                        form_and_corr_col_ids[item].col_id
                                      main_res.name = `Test ${main_res.name}`

                                      // get attributes from collection
                                      let options = {
                                        url: `${base_url}attributes?collection.id=${new_collection_id}&pagesize=1000`,
                                        auth: {
                                          user: username,
                                          pass: password,
                                        },
                                      }

                                      const getCollectionAttributes = (
                                        error,
                                        response,
                                        body,
                                      ) => {
                                        if (
                                          !error &&
                                          response.statusCode == 200
                                        ) {
                                          let res = JSON.parse(body)
                                          let attrMap = {}
                                          for (let p = 0; p < res.length; p++) {
                                            let singleAttr = res[p].key
                                            if (attrMap) {
                                              attrMap[singleAttr] = res[p]
                                              for (
                                                let i = 0;
                                                i < main_res.pages.length;
                                                i++
                                              ) {
                                                let page = main_res.pages[i]
                                                for (
                                                  let j = 0;
                                                  j < page.fieldsets.length;
                                                  j++
                                                ) {
                                                  let fieldset =
                                                    page.fieldsets[j]
                                                  for (
                                                    let k = 0;
                                                    k < fieldset.fields.length;
                                                    k++
                                                  ) {
                                                    let field =
                                                      fieldset.fields[k]
                                                    if (
                                                      field.key ===
                                                      Object.keys(attrMap)[p]
                                                    ) {
                                                      field.attribute =
                                                        attrMap[field.key]
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

                                        function createFormWithNewAttributes(
                                          error,
                                          response,
                                          body,
                                        ) {
                                          if (
                                            !error &&
                                            response.statusCode == 201
                                          ) {
                                            console.log(
                                              'Form created successfully with new test collection',
                                            )
                                          }
                                        }

                                        request(
                                          options,
                                          createFormWithNewAttributes,
                                        )
                                      }, 10000)
                                    }
                                  }

                                  request(options, getExistingForm)
                                }
                              }
                            }

                            request(options, createNewAttributes)
                          }
                        } else {
                          console.log(error)
                        }
                      }

                      request(options, getExistingAttributes)
                    }
                  }

                  request(options, getNewCollectionBySlug)
                }
              }
              request(options, createNewCollection)
            }
          }
        }
      }
      request(options, checkIfSlugExists)
    }
  }
  request(options, getExistingCollection)
}
