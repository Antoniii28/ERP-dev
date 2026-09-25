import { RoleModel } from '../models/Role.js';
import { UserModel } from '../models/User.js';
import { AuthenticationError, ValidationError } from '../middlewares/errorHandler.js';
import { createToken, hashPassword, hashToken, verifyPassword, verifyToken } from '../utils/security.js';

const publicUser = async (userId: string) => {
  const user = await UserModel.findById(userId).populate('roleIds', 'name permissions').lean();
  if (!user) throw new AuthenticationError();
  return {
    id: String(user._id), username: user.username, email: user.email,
    firstName: user.firstName, lastName: user.lastName, companyId: user.companyId ? String(user.companyId) : undefined,
    roles: (user.roleIds as unknown as Array<{ name: string; permissions: string[] }>).map((r) => ({ name: r.name, permissions: r.permissions })),
    isActive: user.isActive,
  };
};

const issueTokens = async (userId: string) => {
  const accessToken = createToken(userId, 'access');
  const refreshToken = createToken(userId, 'refresh');
  await UserModel.findByIdAndUpdate(userId, { refreshTokenHash: hashToken(refreshToken) });
  return { accessToken, refreshToken };
};

export const bootstrapAdmin = async (input: { username: string; email: string; password: string; firstName?: string; lastName?: string }) => {
  if (await UserModel.exists({})) throw new ValidationError('La inicialización ya fue realizada');
  const role = await RoleModel.create({
    name: 'Administrador',
    description: 'Administrador inicial de JAFORA ERP',
    permissions: ['*'],
  });
  const user = await UserModel.create({
    username: input.username, email: input.email, passwordHash: hashPassword(input.password),
    firstName: input.firstName ?? '', lastName: input.lastName ?? '', roleIds: [role._id],
  });
  return { user: await publicUser(String(user._id)), ...(await issueTokens(String(user._id))) };
};

export const login = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
    throw new AuthenticationError('Correo o contraseña incorrectos');
  }
  return { user: await publicUser(String(user._id)), ...(await issueTokens(String(user._id))) };
};

export const refresh = async (refreshToken: string) => {
  const payload = verifyToken(refreshToken, 'refresh');
  const user = await UserModel.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.isActive || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new AuthenticationError('Sesión inválida');
  }
  return { user: await publicUser(payload.sub), ...(await issueTokens(payload.sub)) };
};

export const logout = async (userId: string) => {
  await UserModel.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
};

export const getCurrentUser = publicUser;
