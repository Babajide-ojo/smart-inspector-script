require('dotenv').config()
let request = require('request')
const axios = require("axios");
let base_url = 'https://devlab.formelo.com/api'
let username = process.env.USER_NAME
let password = process.env.PASSWORD

let forms = {
  FAQ: 'vr5mq0j1',  
//  FSRS: '4jpv4nj1' 
}
const createTestForm = async (item, new_collection_id, attributes) => {
    let form = item;
   // console.log('form', form);
    let test_forms_user_group_id = '24jp1wj1'
    let form_creation_resp = ''
    let  attrMap = {}
    
      form['id'] = undefined
      form['uuid'] = undefined
      form['reference_code'] = undefined
  
      let old_collection_id = form.collection.id
      form['collection'].id = new_collection_id
      form['name'] = `Test ` + form.name
      form['user_group'].id = test_forms_user_group_id
      form['user_group'].uuid = undefined
      form['user_group'].name = undefined
  
   
      let get_col_attr_resp = attributes.length
        ? attributes
        : await getCollectionAttributes(old_collection_id)
      if (get_col_attr_resp.status === 200) {
        let col_attributes = get_col_attr_resp.data
        console.log('col_attributes.length', col_attributes.length, col_attributes)
  
        for (let i = 0; i < col_attributes.length; i++) {
          let attr = col_attributes[i]
          attrMap[attr.key] = attr
        }
        //  console.log("attrMap", attrMap);
  
        for (let i = 0; i < form.pages.length; i++) {
          let page = form.pages[i]
  
          for (let j = 0; j < page.fieldsets.length; j++) {
            let fieldset = page.fieldsets[j]
  
            for (let k = 0; k < fieldset.fields.length; k++) {
              let field = fieldset.fields[k]
              field['id'] = undefined
              field['uuid'] = undefined
              field['applet'] = undefined
  
              field['attribute'] = attrMap[field.key]
            }
          }
        }
  
        //  console.log("form after", JSON.stringify(form));
        let headers = {
          'Content-Type': 'application/json',
        }
  
        let post_resp = await axios({
          url: `${base_url}/applets`,
          method: 'POST',
          headers,
          data: JSON.stringify(form),
          auth: {
            username,
            password,
          },
        })
          .then((res) => {
            form_creation_resp = res
            console.log("form creation res", res);
            console.log('form created successfully');
          })
          .catch((err) => console.log('err', err.response.data))
      } else {
        console.log('no collection attributes', get_col_attr_resp)
      }
  

  
    return form_creation_resp
  }
const createCollectionAttributes = async (col_id, attributes) => {
    let created_attributes = []
    for (let i = 0; i < attributes.length; i++) {
      let attr = attributes[i]
      attr['id'] = undefined
      attr['uuid'] = undefined
      attr['collection'].id = col_id
  
      let headers = {
        'Content-Type': 'application/json',
      }
      let opts = {
        url: `${base_url}/attributes`,
        method: 'POST',
        headers,
        data: JSON.stringify(attr),
        auth: {
          username,
          password,
        },
      }
  
      await axios(opts)
        .then((res) => created_attributes.push(res.data))
        .catch((err) => console.log('createCollectionAttributes err', err))
    }
    return created_attributes
  }
const getCollectionAttributes = async (col_id) => {
    let options = {
      url: `${base_url}/attributes?collection.id=${col_id}&pagesize=1000`,
      auth: {
        username,
        password,
      },
    }
    let resp
    await axios(options)
      .then((res) => (resp = res))
      .catch((err) => console.log('get collection attributes error', err))
    return resp
    //console.log("resp", resp);
  }
const createTestCollection = async (existing_collection) => {
    console.log('existing_collection',existing_collection);
    let existing_col_id = existing_collection.id
    existing_collection['id'] = undefined
    existing_collection['uuid'] = undefined
    existing_collection['slug'] = `test_${existing_collection.slug}`
    existing_collection['name'] = `Test ${existing_collection.name}`
    let resp = {}
    let headers = {
      'Content-Type': 'application/json',
    }
  
    // console.log("existing_collection", existing_collection);
    await axios({
      url: `${base_url}/collections`,
      method: 'POST',
      headers,
      data: JSON.stringify(existing_collection),
      auth: {
        username,
        password,
      },
    })
      .then(async (res) => {
        console.log('create col res', res.data)
        let new_col_id = res.data.id
        // console.log({ existing_col_id, new_col_id })
        let get_existing_attr_res = await getCollectionAttributes(existing_col_id)
        if ((get_existing_attr_res.status = 200)) {
          let create_col_attr_res = await createCollectionAttributes(
            new_col_id,
            get_existing_attr_res.data,
          )
          resp = {
            status: 200,
            col_id: new_col_id,
            attributes: create_col_attr_res,
          }
        }
      })
      .catch((err) => console.log('createTestCollection err', err.response.data))
   return resp
  }

const checkIfCollectionSlugExists = async (resp_data) =>{
    const {slug, collection, form} = resp_data;
    let slug_check_params = `test_${resp_data.slug}`
    console.log(slug);
    let response = '', form_attributes = [], new_collection_id = '';
    const options = {
        url: `${base_url}/collections?slug=${slug_check_params}`,
        method: 'GET',
        auth: {
          username,
          password,
        },
      }

      await axios(options).then(async (res) =>{
          //console.log('collection by slug',res);
          if(res.data.length > 0)
          {
             response = await createTestForm(form, new_collection_id, form_attributes)
             console.log(`A collection with the slug name ${slug_check_params} already exists`)
          } else if (res.data.length === 0){
              console.log(`Slug does not exist, hence a collection can be created with the slug: ${slug_check_params}`);

             let collection_details =  await createTestCollection(collection);
             console.log(collection_details);
             new_collection_id = collection_details.col_id
             form_attributes = collection_details //.attributes
             response = await createTestForm(form, new_collection_id, form_attributes)
          }
      }).catch((err) => console.log(err))
}

const getCollectionById = async (form_resp) =>{
   const {collection_id, form } = form_resp;
   //console.log('collection id', collection_id);
  // console.log('form', form);
    const options = {
        url: `${base_url}/collections/${collection_id}`,
        method: 'GET',
        auth: {
          username,
          password,
        },
      }
    let resp_data =null;
    await axios(options).then(async (res) =>{
       resp_data ={
           slug: res.data.slug,
           collection: res.data,
           form: form
       }
       if(res.status === 200){
            await checkIfCollectionSlugExists(resp_data)
       }
    }).catch((err) => console.log(err));
   // return resp_data;
}

const generateTestForm = async (item) => {
    console.log(`Generating Test form for ${item}`)
    const options = {
        url: `${base_url}/applets/${item}`,
        method: 'GET',
        auth: {
          username,
          password,
        },
      }
    let resp = null;

  await axios(options)
    .then( async (res) => {
     form_resp = {
         collection_id: res.data.collection.id,
         form: res.data
     }
     if(res.status === 200){
      const collection = await getCollectionById(form_resp)
      console.log(collection);
     }
    }).catch((err) => console.log('get existing form error', err))
  return resp
}



const run = async () => {
    for (let item in forms) {
     const form = await generateTestForm(forms[item])
    // console.log('get form response : ', form);
    }
  }
  
  run();
