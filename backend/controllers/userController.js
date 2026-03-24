const userDao = require("../models/dao/usersDao");

//[POST]
exports.createUser = async (req, res) => {
  try {
    //chama Dao passando os dados que vieram do front-end
    const newUser = await userDao.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro na criação deo usuário:", error);
    res.status(500).json({
      error: "Erro ao criar usuário no banco de dados",
      details: error.message,
    });
  }
};

//[GET]
exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const users = await userDao.findAll(search);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar usuários no banco de dados.",
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userDao.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao buscar usuário no banco de dados",
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await userDao.update(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao atualizar usuário no banco de dados",
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedUser = await userDao.updateStatus(req.params.id, status);
    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({
      error: "Erro ao atualizar status no banco de dados",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await userDao.delete(req.params.id);
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao deletar usuário no banco de dados",
    });
  }
};
