const { nanoid } = require('nanoid');
const database = require('./books');

const validasi = (json, jenis) => {
  let pesanerror;
  if(jenis === 1){
    pesanerror = 'Gagal menambahkan buku';
  }else if(jenis === 2){
    pesanerror = 'Gagal memperbarui buku';
  }
  if(json.name){
    if(typeof json.name !== 'string'){
      return { status: 'fail', message: 'nama harus dalam bentuk string' };
    }else if(json.name.length <= 0){
      return { status: 'fail', message: `${pesanerror}. Mohon isi nama buku` };
    }
  }else{
    return { status: 'fail', message: `${pesanerror}. Mohon isi nama buku` };
  }
  if(json.year){
    if(typeof json.year !== 'number'){
      return { status: 'fail', message: 'year harus dalam bentuk number' };
    }else if(json.year <= 0){
      return { status: 'fail', message: 'year belum diisi' };
    }
  }else{
    return { status: 'fail', message: 'year belum diisi' };
  }
  if(json.author){
    if(typeof json.author !== 'string'){
      return { status: 'fail', message: 'author harus dalam bentuk string' };
    }else if(json.author.length <= 0){
      return { status: 'fail', message: 'author belum diisi' };
    }
  }else{
    return { status: 'fail', message: 'author belum diisi' };
  }
  if(json.summary){
    if(typeof json.summary !== 'string'){
      return { status: 'fail', message: 'summary harus dalam bentuk string' };
    }else if(json.summary.length <= 0){
      return { status: 'fail', message: 'summary belum diisi' };
    }
  }else{
    return { status: 'fail', message: 'summary belum diisi' };
  }
  if(json.publisher){
    if(typeof json.publisher !== 'string'){
      return { status: 'fail', message: 'publisher harus dalam bentuk string' };
    }else if(json.publisher.length <= 0){
      return { status: 'fail', message: 'publisher belum diisi' };
    }
  }else{
    return { status: 'fail', message: 'publisher belum diisi' };
  }
  if(json.pageCount){
    if(typeof json.pageCount !== 'number'){
      return { status: 'fail', message: 'pageCount harus dalam bentuk number' };
    }else if(json.pageCount <= 0){
      return { status: 'fail', message: 'pageCount belum diisi' };
    }
  }else{
    return { status: 'fail', message: 'pageCount belum diisi' };
  }
  if(json.readPage){
    if(typeof json.readPage !== 'number'){
      return { status: 'fail', message: 'readPage harus dalam bentuk number' };
    }else if(json.readPage < 0){
      return { status: 'fail', message: 'readPage belum diisi' };
    }else if(json.readPage > json.pageCount){
      return { status: 'fail', message: `${pesanerror}. readPage tidak boleh lebih besar dari pageCount` };
    }
  }else if(json.readPage !== 0){
    return { status: 'fail', message: 'readPage belum diisi' };
  }
  if(json.reading !== null && json.reading !== undefined){
    if(typeof json.reading !== 'boolean'){
      return { status: 'fail', message: 'reading harus dalam bentuk boolean' };
    }else if(json.reading !== true && json.reading !== false){
      return { status: 'fail', message: 'reading belum diisi (false atau true)' };
    }
  }else{
    return { status: 'fail', message: 'reading belum diisi (false atau true)' };
  }
  return { status: 'error', message: 'Buku gagal ditambahkan' };
};
const addBookHandler = (request, h) => {
  let tempResponse = validasi(request.payload, 1);

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  if(tempResponse.status !== 'fail'){
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
    const finished = (pageCount === readPage);
    const newBook = {
      id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
    };
    database.push(newBook);
    const isSuccess = database.filter((books) => books.id === id).length > 0;
    if(isSuccess){
      tempResponse = {
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: `${id}`
        }
      };
    }
  }

  const response = h.response(tempResponse);
  if(tempResponse.status === 'fail'){
    response.code(400);
  }else if(tempResponse.status === 'success'){
    response.code(201);
  }else{
    response.code(500);
  }
  response.header('Access-Control-Allow-Origin', 'http://localhost:5000');
  return response;
};
const getAllBooksHandler = (request, h) => {
  let { name } = request.query;
  let { reading } = request.query;
  let { finished } = request.query;
  let response;
  let books = [];
  let tampungbooks;
  if(name !== undefined || reading !== undefined || finished !== undefined){
    tampungbooks = database;
    let temp;
    let datatemp;
    if(name !== undefined){
      const katakunci = name.split(' ');
      if(katakunci.length > 0){
        let tampungtemp = [];
        katakunci.forEach((arai) => {
          if(arai.length > 0){
            temp = tampungbooks.filter((b) => b.name.toLowerCase().includes(arai.toLowerCase()));
            if(temp !== undefined){
              tampungtemp.push(temp);
            }
          }
        });
        if(tampungtemp.length > 0){
          tampungtemp = [...new Set(tampungtemp)];
          [tampungbooks] = tampungtemp;
        }
      }
    }
    if(reading !== undefined){
      reading = parseInt(reading);
      if(reading === 0){
        temp = tampungbooks.filter((b) => b.reading === false);
      }else if(reading === 1){
        temp = tampungbooks.filter((b) => b.reading === true);
      }
      tampungbooks = temp;
    }
    if(finished !== undefined){
      finished = parseInt(finished);
      if(finished === 0){
        temp = tampungbooks.filter((b) => b.finished === false);
      }else if(finished === 1){
        temp = tampungbooks.filter((b) => b.finished === true);
      }
      tampungbooks = temp;
    }
    if(tampungbooks.length > 0){
      tampungbooks.forEach((key) => {
        let { id, name, publisher } = key;
        datatemp = { id, name, publisher };
        books.push(datatemp);
      });
      response = h.response({
        status: 'success',
        data: {
          books,
        },
      });
      response.code(200);
    }else{
      response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      });
      response.code(404);
    }
  }else{
    tampungbooks = [];
    database.forEach((key) => {
      let { id, name, publisher } = key;
      let data = { id, name, publisher };
      tampungbooks.push(data);
    });
    books = tampungbooks;
    response = h.response({
      status: 'success',
      data: {
        books
      }
    });
    response.code(200);
  }
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};
const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
   
  let book = database.filter((n) => n.id === id)[0];
  let response;
  if(book !== undefined) {
    response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
  }else{
    response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
  }
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};
const setPayload = (json, payload) => {
  if(payload.name){
    json.name = payload.name;
  }else if(json.name.length <= 0){
    json.name = '';
  }
  if(payload.year){
    json.year = payload.year;
  }else if(json.year <= 0){
    json.year = 0;
  }
  if(payload.author){
    json.author = payload.author;
  }else if(json.author.length <= 0){
    json.author = '';
  }
  if(payload.summary){
    json.summary = payload.summary;
  }else if(json.summary.length <= 0){
    json.summary = '';
  }
  if(payload.publisher){
    json.publisher = payload.publisher;
  }else if(json.publisher.length <= 0){
    json.publisher = '';
  }
  if(payload.pageCount){
    json.pageCount = payload.pageCount;
  }else if(json.pageCount <= 0){
    json.pageCount = 0;
  }
  if(payload.readPage){
    json.readPage = payload.readPage;
  }else if(json.readPage < 0){
    json.readPage = 0;
  }
  if(payload.finished === true || payload.finished === false){
    json.finished = payload.finished;
  }
  if(payload.reading === true || payload.reading === false){
    json.reading = payload.reading;
  }
  if(payload.updatedAt){
    json.updatedAt = payload.updatedAt;
  }
  return json;
};
const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = database.findIndex((book) => book.id === id);

  let response;
  if (index !== -1) {
    let tempResponse = validasi(request.payload, 2);

    if(tempResponse.status !== 'fail'){
      const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
      const updatedAt = new Date().toISOString();
      const finished = (pageCount === readPage);
      database[index] = setPayload(
        database[index],
        {
          name, year, author, summary, publisher, pageCount, readPage, finished, reading, updatedAt
        }
      );
      tempResponse = { status: 'success', message: 'Buku berhasil diperbarui' };
    }
    response = h.response(tempResponse);
    if(tempResponse.status === 'fail'){
      response.code(400);
    }else if(tempResponse.status === 'success'){
      response.code(200);
    }else{
      response.code(500);
    }
  }else{
    response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
  }
  response.header('Access-Control-Allow-Origin', 'http://localhost:5000');
  return response;
};
const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  
  const index = database.findIndex((book) => book.id === id);

  let response;
  if (index !== -1) {
    database.splice(index, 1);
    response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
  }else{
    response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
  }
  response.header('Access-Control-Allow-Origin', 'http://localhost:5000');
  return response;
};
const error404 = (request, h) => {
  const response = h.response('Halaman tidak ditemukan');
  response.code(404);
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};
module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler, error404 };