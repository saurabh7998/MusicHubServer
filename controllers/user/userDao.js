import userModel from "./userModel.js";

export const createUser = async (user) =>
    await userModel.create(user)

export const findUserByEmail = async ({email}) => {
    const res = await userModel.findOne({email})
    return res;
}

export const findUserById = async  (id) => (await userModel.findOne({_id: id}));
