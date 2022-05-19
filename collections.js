require('dotenv').config()
let request = require('request')
let base_url = 'https://devlab.formelo.com/api/'

let username = process.env.USER_NAME
let password = process.env.PASSWORD

console.log('processing request...')

// collection ids object
let collection_ids = {
  faq_navigator: 'mj8g55ly',
  student_register: '8rdo96jx',
  faq: '5rgv3drw', // slug name already exist for this so it should through an error message.
}

for (let collection_id in collection_ids) {
  // console.log(collection_ids[collection_id])
  let options = {
    url: `${base_url}collections/${collection_ids[collection_id]}`,
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
              console.log("An error occured ");
              console.log("===============================");
              console.log(`collection id = ${collection_ids[collection_id]} : slug name already exists for collection with id ${all_collections[j].id}`)
              console.log("===============================");
              console.log(" ");
            
            } else {
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
                        url: `${base_url}attributes?collection.id=${collection_ids[collection_id]}&pagesize=1000`,
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

                            singleAttr.collection.id = new_collection_id;

                            // console.log(res)

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

                                if(res.length - i === i) {
                                  console.log("Success");
                                  console.log("===============================");
                                  console.log(`attributes created successfully for new collection with id = ${new_collection_id}`)
                                  console.log("===============================");
                                  console.log(" ");
                          
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

