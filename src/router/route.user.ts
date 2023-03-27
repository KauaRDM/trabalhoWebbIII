import { Router } from "express";
import { Database } from '../database';
import { randomUUID } from 'node:crypto';

//variaveis ativas
const userRoute = Router();
const database = new Database();
const table = "user";

userRoute.get('/', (request, response ) => {
  const user = database.select(table);

  response.json(user)
});

userRoute.get('/:id', (request, response) => {
  const { id } = request.params
  const result = database.select(table, id);

  if(result === undefined) response.status(400).json({msg:'Erro! Esse usuário não foi encontrado.'})

  response.json(result)
});

//adicionar usuarios
userRoute.post('/', (request, response ) => {
  const { nome, cpf, cidade, cep } = request.body;

  const user = {
    id: randomUUID(),
    nome,
    cpf,
    cidade,
    cep,
    saldo: 0,
    transacao: []
  };

  database.insert(table, user);
  response.status(201).send({msg:`Sucesso! O usuário ${nome} foi cadastrado.`});
});

//deletar usuario pelo id
userRoute.delete('/:id', (request, response) => {
  const {id} = request.params
  const userExist:any = database.select(table, id);

  if(userExist === undefined)
  return response.status(400).json(
    {msg:'Erro! Esse usuário não foi encotrado.'});

    database.delete(table, id)

    response.status(202).json(
      {msg: `Sucesso! O usuário ${userExist.nome} foi deletado.` });

});

//editar usuarios
userRoute.put('/:id', (request,response)=>{
  const { id } = request.params;
  const {nome, cpf, cidade, cep} = request.body;
  const userExist:any = database.select(table, id);

  if(userExist === undefined)
  return response.status(400).json(
    {msg:'Erro! Esse usuário não foi encontrado no nosso sistema.'});

//se o usuario for encontrado
    const user:any = {nome, cpf, cidade, cep};

    const filteredUser: any = {};
      for (const key in user) {
        if (user[key] !== undefined) {
      filteredUser[key] = user[key];
    }
  }
    const infoDatabase:any = {...userExist, ...filteredUser}
    database.update(table, id, infoDatabase);

    response.status(202).json(
      {msg: `Sucesso! O usuário ${userExist.nome} teve alterações no sistema.` });
});

//retirar dinheiro pelo id
userRoute.put('/retirada/:id', (request,response)=>{
  const { id } = request.params;
  const {tipo, valor} = request.body;
  const userExist:any = database.select(table, id);

  if(userExist === undefined)
  return response.status(400).json(
    {msg:'Erro! Esse usuário não foi encontrado no sistema.'});

    const nome = userExist.nome;

    if(userExist.saldo >= Number(valor)) {

    let transacao = userExist.transacao;
    transacao.push({tipo, valor});

    let saldo = userExist.saldo;
    database.update(table, id, {id, nome, saldo: saldo - Number(valor), transacao});

    response.status(201).json(
      {msg: `Sucesso! Foi retirado o valor de R$${valor}, do usuário: ${nome}.` });

    } else {
      response.status(404).json(
      {msg: `Erro! Você não pode retirar mais dinheiro do que possui.`});
    }
});

//metodo de deposito
userRoute.put('/deposito/:id', (request,response)=>{
  const { id } = request.params;
  const {tipo, valor} = request.body;
  const userExist:any = database.select(table, id);

  if(userExist === undefined)
  return response.status(400).json(
    {msg:'Erro! Esse usuário não foi encontrado no sistema.'});

    const nome = userExist.nome;

    let transacao = userExist.transacao;
    transacao.push({tipo, valor});

    let saldo = userExist.saldo;
    database.update(table, id, {id, nome, saldo: saldo + Number(valor), transacao});

    response.status(201).json(
      {msg: `Sucesso! Foi depositado o valor de R$${valor}, na conta do usuário: ${nome}` });
});

export {userRoute}
