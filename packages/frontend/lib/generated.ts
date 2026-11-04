import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPlasticoToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPlasticoTokenAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'destinatario',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cantidad',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'transaccionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensMinteados',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IRegistroEntidades
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iRegistroEntidadesAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nombreHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'CentroRegistrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'centro',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'verificador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CentroVerificado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nombreHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'MunicipalidadRegistrada',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'identidadHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'UsuarioRegistrado',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esCentroVerificado',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esMunicipalidad',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esUsuario',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
      { name: '_loteM2', internalType: 'uint32', type: 'uint32' },
      { name: '_tipoVivienda', internalType: 'uint8', type: 'uint8' },
      { name: '_esPublico', internalType: 'bool', type: 'bool' },
    ],
    name: 'registrarCentroRecolector',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'wallet', internalType: 'address', type: 'address' },
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarMunicipalidad',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_identidadHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
      { name: '_loteM2', internalType: 'uint32', type: 'uint32' },
      { name: '_tipoVivienda', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarUsuario',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_centro', internalType: 'address', type: 'address' }],
    name: 'verificarCentro',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITransaccionesPlastico
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iTransaccionesPlasticoAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'pesoOficial',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'factorAjuste',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LoteMunicipalCerrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'municipalidad',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fechaRecoleccion',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      { name: 'rutaId', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'LoteMunicipalIniciado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'pesoOficial',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'factorAjuste',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LoteTipoCerrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'nuevoPesoGramos',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransaccionReconciliada',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'origen',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'destino',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoGramos',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdtMonto',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tipo',
        internalType: 'enum TipoTransaccion',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'TransaccionRegistrada',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: '_pesoOficialGramos', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'cerrarLotePorTipo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_fechaRecoleccion', internalType: 'uint64', type: 'uint64' },
      { name: '_rutaId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'iniciarLoteMunicipal',
    outputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      { name: '_usuario', internalType: 'address', type: 'address' },
      { name: '_pesoGramos', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: '_rutaId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarEntregaMunicipal',
    outputs: [
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      { name: '_pesoGramos', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: '_rutaId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarEntregaUsuario',
    outputs: [
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'usuario', internalType: 'address', type: 'address' },
      { name: 'pesoGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'tipo', internalType: 'enum TipoTransaccion', type: 'uint8' },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
    ],
    name: 'registrarTransaccionGratuita',
    outputs: [
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contraparte', internalType: 'address', type: 'address' },
      { name: 'pesoGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'montoUSDT', internalType: 'uint256', type: 'uint256' },
      { name: 'usuarioPaga', internalType: 'bool', type: 'bool' },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
    ],
    name: 'registrarTransaccionPagada',
    outputs: [
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockUSDT
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockUsdtAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'initialOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'FAUCET_LIMIT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PlasticoToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const plasticoTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'destinatario',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cantidad',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'transaccionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TokensMinteados',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MINTER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'admin', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RegistroEntidades
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const registroEntidadesAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nombreHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'CentroRegistrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'centro',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'verificador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'CentroVerificado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nombreHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'MunicipalidadRegistrada',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'wallet',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'identidadHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'UsuarioRegistrado',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MUNICIPALIDAD_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERIFIER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cedulaHashToWallet',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'centros',
    outputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'ubicacion',
        internalType: 'struct Residencia',
        type: 'tuple',
        components: [
          { name: 'provincia', internalType: 'enum Provincia', type: 'uint8' },
          { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
          { name: 'loteM2', internalType: 'uint32', type: 'uint32' },
          { name: 'tipoVivienda', internalType: 'uint8', type: 'uint8' },
        ],
      },
      { name: 'esPublico', internalType: 'bool', type: 'bool' },
      { name: 'verificado', internalType: 'bool', type: 'bool' },
      { name: 'verificadoEn', internalType: 'uint64', type: 'uint64' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esCentroVerificado',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esMunicipalidad',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esUsuario',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'admin', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'municipalidades',
    outputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'wallet', internalType: 'address', type: 'address' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'provincia', internalType: 'enum Provincia', type: 'uint8' },
      { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
      { name: 'loteM2', internalType: 'uint32', type: 'uint32' },
      { name: 'tipoVivienda', internalType: 'uint8', type: 'uint8' },
      { name: 'esPublico', internalType: 'bool', type: 'bool' },
    ],
    name: 'registrarCentroRecolector',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'wallet', internalType: 'address', type: 'address' },
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarMunicipalidad',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'identidadHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
      { name: 'loteM2', internalType: 'uint32', type: 'uint32' },
      { name: 'tipoVivienda', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarUsuario',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'usuarios',
    outputs: [
      { name: 'identidadHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'wallet', internalType: 'address', type: 'address' },
      {
        name: 'residencia',
        internalType: 'struct Residencia',
        type: 'tuple',
        components: [
          { name: 'provincia', internalType: 'enum Provincia', type: 'uint8' },
          { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
          { name: 'loteM2', internalType: 'uint32', type: 'uint32' },
          { name: 'tipoVivienda', internalType: 'uint8', type: 'uint8' },
        ],
      },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'registradoEn', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'centro', internalType: 'address', type: 'address' }],
    name: 'verificarCentro',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TransaccionesPlastico
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const transaccionesPlasticoAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'pesoOficial',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'factorAjuste',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LoteMunicipalCerrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'municipalidad',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fechaRecoleccion',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
      { name: 'rutaId', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'LoteMunicipalIniciado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'pesoOficial',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'factorAjuste',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LoteTipoCerrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'nuevoPesoGramos',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransaccionReconciliada',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'origen',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'destino',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoGramos',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'usdtMonto',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tipo',
        internalType: 'enum TipoTransaccion',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'TransaccionRegistrada',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PAUSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: '_pesoOficialGramos', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'cerrarLotePorTipo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'enum TipoPlastico', type: 'uint8' },
    ],
    name: 'factorAjustePorTipo',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getTransaccionesPorDireccion',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'fechaRecoleccion', internalType: 'uint64', type: 'uint64' },
      { name: 'rutaId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'iniciarLoteMunicipal',
    outputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: '_plasticoToken', internalType: 'address', type: 'address' },
      { name: '_registro', internalType: 'address', type: 'address' },
      { name: '_usdt', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'lotesMunicipales',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'municipalidad', internalType: 'address', type: 'address' },
      { name: 'fechaRecoleccion', internalType: 'uint64', type: 'uint64' },
      { name: 'rutaId', internalType: 'uint8', type: 'uint8' },
      { name: 'cerrado', internalType: 'bool', type: 'bool' },
      { name: 'pesoOficialGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'factorAjuste', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextLoteId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextTransaccionId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'enum TipoPlastico', type: 'uint8' },
    ],
    name: 'pesoOficialPorTipo',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'plasticoToken',
    outputs: [
      { name: '', internalType: 'contract IPlasticoToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      { name: '_usuario', internalType: 'address', type: 'address' },
      { name: '_pesoGramos', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: '_rutaId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarEntregaMunicipal',
    outputs: [
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      { name: '_pesoGramos', internalType: 'uint256', type: 'uint256' },
      {
        name: '_tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: '_rutaId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarEntregaUsuario',
    outputs: [
      { name: 'transaccionId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'usuario', internalType: 'address', type: 'address' },
      { name: 'pesoGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'tipo', internalType: 'enum TipoTransaccion', type: 'uint8' },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
    ],
    name: 'registrarTransaccionGratuita',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contraparte', internalType: 'address', type: 'address' },
      { name: 'pesoGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'montoUSDT', internalType: 'uint256', type: 'uint256' },
      { name: 'usuarioPaga', internalType: 'bool', type: 'bool' },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
    ],
    name: 'registrarTransaccionPagada',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'registro',
    outputs: [
      {
        name: '',
        internalType: 'contract IRegistroEntidades',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_loteId', internalType: 'uint256', type: 'uint256' },
      { name: '_tipo', internalType: 'enum TipoPlastico', type: 'uint8' },
    ],
    name: 'resumenTipoEnLote',
    outputs: [
      { name: 'presente', internalType: 'bool', type: 'bool' },
      { name: 'reconciliado', internalType: 'bool', type: 'bool' },
      { name: 'pesoDeclaradoTotal', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoActualTotal', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoOficialGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'factorAjuste', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'enum TipoPlastico', type: 'uint8' },
    ],
    name: 'tipoReconciliadoDeLote',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'transacciones',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'origen', internalType: 'address', type: 'address' },
      { name: 'destino', internalType: 'address', type: 'address' },
      { name: 'pesoGramos', internalType: 'uint216', type: 'uint216' },
      { name: 'timestamp', internalType: 'uint32', type: 'uint32' },
      { name: 'tokensMinteados', internalType: 'uint256', type: 'uint256' },
      { name: 'usdtPagado', internalType: 'uint256', type: 'uint256' },
      { name: 'tipo', internalType: 'enum TipoTransaccion', type: 'uint8' },
      {
        name: 'tipoPlastico',
        internalType: 'enum TipoPlastico',
        type: 'uint8',
      },
      { name: 'reconciliada', internalType: 'bool', type: 'bool' },
      { name: 'loteId', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoGramosDeclarado', internalType: 'uint216', type: 'uint216' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transaccionesPorDireccion',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdt',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__
 */
export const useReadIPlasticoToken = /*#__PURE__*/ createUseReadContract({
  abi: iPlasticoTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadIPlasticoTokenBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: iPlasticoTokenAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__
 */
export const useWriteIPlasticoToken = /*#__PURE__*/ createUseWriteContract({
  abi: iPlasticoTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useWriteIPlasticoTokenBurnFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: iPlasticoTokenAbi,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteIPlasticoTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: iPlasticoTokenAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__
 */
export const useSimulateIPlasticoToken =
  /*#__PURE__*/ createUseSimulateContract({ abi: iPlasticoTokenAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useSimulateIPlasticoTokenBurnFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iPlasticoTokenAbi,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iPlasticoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateIPlasticoTokenMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iPlasticoTokenAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iPlasticoTokenAbi}__
 */
export const useWatchIPlasticoTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iPlasticoTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iPlasticoTokenAbi}__ and `eventName` set to `"TokensMinteados"`
 */
export const useWatchIPlasticoTokenTokensMinteadosEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iPlasticoTokenAbi,
    eventName: 'TokensMinteados',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useReadIRegistroEntidades = /*#__PURE__*/ createUseReadContract({
  abi: iRegistroEntidadesAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esCentroVerificado"`
 */
export const useReadIRegistroEntidadesEsCentroVerificado =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esCentroVerificado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esMunicipalidad"`
 */
export const useReadIRegistroEntidadesEsMunicipalidad =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esMunicipalidad',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esUsuario"`
 */
export const useReadIRegistroEntidadesEsUsuario =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esUsuario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useWriteIRegistroEntidades = /*#__PURE__*/ createUseWriteContract({
  abi: iRegistroEntidadesAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarCentroRecolector"`
 */
export const useWriteIRegistroEntidadesRegistrarCentroRecolector =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarCentroRecolector',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarMunicipalidad"`
 */
export const useWriteIRegistroEntidadesRegistrarMunicipalidad =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarMunicipalidad',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarUsuario"`
 */
export const useWriteIRegistroEntidadesRegistrarUsuario =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarUsuario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"verificarCentro"`
 */
export const useWriteIRegistroEntidadesVerificarCentro =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'verificarCentro',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useSimulateIRegistroEntidades =
  /*#__PURE__*/ createUseSimulateContract({ abi: iRegistroEntidadesAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarCentroRecolector"`
 */
export const useSimulateIRegistroEntidadesRegistrarCentroRecolector =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarCentroRecolector',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarMunicipalidad"`
 */
export const useSimulateIRegistroEntidadesRegistrarMunicipalidad =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarMunicipalidad',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarUsuario"`
 */
export const useSimulateIRegistroEntidadesRegistrarUsuario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarUsuario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"verificarCentro"`
 */
export const useSimulateIRegistroEntidadesVerificarCentro =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'verificarCentro',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useWatchIRegistroEntidadesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iRegistroEntidadesAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"CentroRegistrado"`
 */
export const useWatchIRegistroEntidadesCentroRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'CentroRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"CentroVerificado"`
 */
export const useWatchIRegistroEntidadesCentroVerificadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'CentroVerificado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"MunicipalidadRegistrada"`
 */
export const useWatchIRegistroEntidadesMunicipalidadRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'MunicipalidadRegistrada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"UsuarioRegistrado"`
 */
export const useWatchIRegistroEntidadesUsuarioRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'UsuarioRegistrado',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__
 */
export const useWriteITransaccionesPlastico =
  /*#__PURE__*/ createUseWriteContract({ abi: iTransaccionesPlasticoAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"cerrarLotePorTipo"`
 */
export const useWriteITransaccionesPlasticoCerrarLotePorTipo =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'cerrarLotePorTipo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"iniciarLoteMunicipal"`
 */
export const useWriteITransaccionesPlasticoIniciarLoteMunicipal =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'iniciarLoteMunicipal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaMunicipal"`
 */
export const useWriteITransaccionesPlasticoRegistrarEntregaMunicipal =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarEntregaMunicipal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaUsuario"`
 */
export const useWriteITransaccionesPlasticoRegistrarEntregaUsuario =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarEntregaUsuario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionGratuita"`
 */
export const useWriteITransaccionesPlasticoRegistrarTransaccionGratuita =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarTransaccionGratuita',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionPagada"`
 */
export const useWriteITransaccionesPlasticoRegistrarTransaccionPagada =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarTransaccionPagada',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__
 */
export const useSimulateITransaccionesPlastico =
  /*#__PURE__*/ createUseSimulateContract({ abi: iTransaccionesPlasticoAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"cerrarLotePorTipo"`
 */
export const useSimulateITransaccionesPlasticoCerrarLotePorTipo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'cerrarLotePorTipo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"iniciarLoteMunicipal"`
 */
export const useSimulateITransaccionesPlasticoIniciarLoteMunicipal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'iniciarLoteMunicipal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaMunicipal"`
 */
export const useSimulateITransaccionesPlasticoRegistrarEntregaMunicipal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarEntregaMunicipal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaUsuario"`
 */
export const useSimulateITransaccionesPlasticoRegistrarEntregaUsuario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarEntregaUsuario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionGratuita"`
 */
export const useSimulateITransaccionesPlasticoRegistrarTransaccionGratuita =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarTransaccionGratuita',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionPagada"`
 */
export const useSimulateITransaccionesPlasticoRegistrarTransaccionPagada =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTransaccionesPlasticoAbi,
    functionName: 'registrarTransaccionPagada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__
 */
export const useWatchITransaccionesPlasticoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iTransaccionesPlasticoAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `eventName` set to `"LoteMunicipalCerrado"`
 */
export const useWatchITransaccionesPlasticoLoteMunicipalCerradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTransaccionesPlasticoAbi,
    eventName: 'LoteMunicipalCerrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `eventName` set to `"LoteMunicipalIniciado"`
 */
export const useWatchITransaccionesPlasticoLoteMunicipalIniciadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTransaccionesPlasticoAbi,
    eventName: 'LoteMunicipalIniciado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `eventName` set to `"LoteTipoCerrado"`
 */
export const useWatchITransaccionesPlasticoLoteTipoCerradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTransaccionesPlasticoAbi,
    eventName: 'LoteTipoCerrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `eventName` set to `"TransaccionReconciliada"`
 */
export const useWatchITransaccionesPlasticoTransaccionReconciliadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTransaccionesPlasticoAbi,
    eventName: 'TransaccionReconciliada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTransaccionesPlasticoAbi}__ and `eventName` set to `"TransaccionRegistrada"`
 */
export const useWatchITransaccionesPlasticoTransaccionRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTransaccionesPlasticoAbi,
    eventName: 'TransaccionRegistrada',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__
 */
export const useReadMockUsdt = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"FAUCET_LIMIT"`
 */
export const useReadMockUsdtFaucetLimit = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'FAUCET_LIMIT',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadMockUsdtAllowance = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadMockUsdtBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadMockUsdtDecimals = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"name"`
 */
export const useReadMockUsdtName = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMockUsdtOwner = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadMockUsdtSymbol = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadMockUsdtTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: mockUsdtAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__
 */
export const useWriteMockUsdt = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdtAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteMockUsdtApprove = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdtAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"faucet"`
 */
export const useWriteMockUsdtFaucet = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdtAbi,
  functionName: 'faucet',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteMockUsdtMint = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdtAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMockUsdtRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockUsdtAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteMockUsdtTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: mockUsdtAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteMockUsdtTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockUsdtAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMockUsdtTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockUsdtAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__
 */
export const useSimulateMockUsdt = /*#__PURE__*/ createUseSimulateContract({
  abi: mockUsdtAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateMockUsdtApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdtAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"faucet"`
 */
export const useSimulateMockUsdtFaucet =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdtAbi,
    functionName: 'faucet',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateMockUsdtMint = /*#__PURE__*/ createUseSimulateContract({
  abi: mockUsdtAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMockUsdtRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdtAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateMockUsdtTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdtAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateMockUsdtTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdtAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockUsdtAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMockUsdtTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockUsdtAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdtAbi}__
 */
export const useWatchMockUsdtEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: mockUsdtAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdtAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchMockUsdtApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockUsdtAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdtAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMockUsdtOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockUsdtAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockUsdtAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchMockUsdtTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockUsdtAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__
 */
export const useReadPlasticoToken = /*#__PURE__*/ createUseReadContract({
  abi: plasticoTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadPlasticoTokenDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"MINTER_ROLE"`
 */
export const useReadPlasticoTokenMinterRole =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'MINTER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useReadPlasticoTokenPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadPlasticoTokenUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadPlasticoTokenAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadPlasticoTokenBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadPlasticoTokenDecimals = /*#__PURE__*/ createUseReadContract(
  { abi: plasticoTokenAbi, functionName: 'decimals' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadPlasticoTokenGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadPlasticoTokenHasRole = /*#__PURE__*/ createUseReadContract({
  abi: plasticoTokenAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadPlasticoTokenName = /*#__PURE__*/ createUseReadContract({
  abi: plasticoTokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"paused"`
 */
export const useReadPlasticoTokenPaused = /*#__PURE__*/ createUseReadContract({
  abi: plasticoTokenAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadPlasticoTokenProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadPlasticoTokenSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadPlasticoTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: plasticoTokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadPlasticoTokenTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: plasticoTokenAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__
 */
export const useWritePlasticoToken = /*#__PURE__*/ createUseWriteContract({
  abi: plasticoTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWritePlasticoTokenApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useWritePlasticoTokenBurnFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWritePlasticoTokenGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useWritePlasticoTokenInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWritePlasticoTokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: plasticoTokenAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"pause"`
 */
export const useWritePlasticoTokenPause = /*#__PURE__*/ createUseWriteContract({
  abi: plasticoTokenAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWritePlasticoTokenRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWritePlasticoTokenRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWritePlasticoTokenTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWritePlasticoTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"unpause"`
 */
export const useWritePlasticoTokenUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWritePlasticoTokenUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: plasticoTokenAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__
 */
export const useSimulatePlasticoToken = /*#__PURE__*/ createUseSimulateContract(
  { abi: plasticoTokenAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulatePlasticoTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useSimulatePlasticoTokenBurnFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulatePlasticoTokenGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulatePlasticoTokenInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulatePlasticoTokenMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulatePlasticoTokenPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulatePlasticoTokenRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulatePlasticoTokenRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulatePlasticoTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulatePlasticoTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulatePlasticoTokenUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link plasticoTokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulatePlasticoTokenUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: plasticoTokenAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__
 */
export const useWatchPlasticoTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: plasticoTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchPlasticoTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchPlasticoTokenInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchPlasticoTokenPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchPlasticoTokenRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchPlasticoTokenRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchPlasticoTokenRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"TokensMinteados"`
 */
export const useWatchPlasticoTokenTokensMinteadosEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'TokensMinteados',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchPlasticoTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchPlasticoTokenUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link plasticoTokenAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchPlasticoTokenUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: plasticoTokenAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useReadRegistroEntidades = /*#__PURE__*/ createUseReadContract({
  abi: registroEntidadesAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadRegistroEntidadesDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"MUNICIPALIDAD_ROLE"`
 */
export const useReadRegistroEntidadesMunicipalidadRole =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'MUNICIPALIDAD_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadRegistroEntidadesUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"VERIFIER_ROLE"`
 */
export const useReadRegistroEntidadesVerifierRole =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'VERIFIER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"cedulaHashToWallet"`
 */
export const useReadRegistroEntidadesCedulaHashToWallet =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'cedulaHashToWallet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"centros"`
 */
export const useReadRegistroEntidadesCentros =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'centros',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esCentroVerificado"`
 */
export const useReadRegistroEntidadesEsCentroVerificado =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esCentroVerificado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esMunicipalidad"`
 */
export const useReadRegistroEntidadesEsMunicipalidad =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esMunicipalidad',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esUsuario"`
 */
export const useReadRegistroEntidadesEsUsuario =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esUsuario',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadRegistroEntidadesGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadRegistroEntidadesHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"municipalidades"`
 */
export const useReadRegistroEntidadesMunicipalidades =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'municipalidades',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadRegistroEntidadesProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadRegistroEntidadesSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"usuarios"`
 */
export const useReadRegistroEntidadesUsuarios =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'usuarios',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useWriteRegistroEntidades = /*#__PURE__*/ createUseWriteContract({
  abi: registroEntidadesAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteRegistroEntidadesGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteRegistroEntidadesInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarCentroRecolector"`
 */
export const useWriteRegistroEntidadesRegistrarCentroRecolector =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarCentroRecolector',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarMunicipalidad"`
 */
export const useWriteRegistroEntidadesRegistrarMunicipalidad =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarMunicipalidad',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarUsuario"`
 */
export const useWriteRegistroEntidadesRegistrarUsuario =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarUsuario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteRegistroEntidadesRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteRegistroEntidadesRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteRegistroEntidadesUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"verificarCentro"`
 */
export const useWriteRegistroEntidadesVerificarCentro =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'verificarCentro',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useSimulateRegistroEntidades =
  /*#__PURE__*/ createUseSimulateContract({ abi: registroEntidadesAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateRegistroEntidadesGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateRegistroEntidadesInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarCentroRecolector"`
 */
export const useSimulateRegistroEntidadesRegistrarCentroRecolector =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarCentroRecolector',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarMunicipalidad"`
 */
export const useSimulateRegistroEntidadesRegistrarMunicipalidad =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarMunicipalidad',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarUsuario"`
 */
export const useSimulateRegistroEntidadesRegistrarUsuario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarUsuario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateRegistroEntidadesRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateRegistroEntidadesRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateRegistroEntidadesUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"verificarCentro"`
 */
export const useSimulateRegistroEntidadesVerificarCentro =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'verificarCentro',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useWatchRegistroEntidadesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: registroEntidadesAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"CentroRegistrado"`
 */
export const useWatchRegistroEntidadesCentroRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'CentroRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"CentroVerificado"`
 */
export const useWatchRegistroEntidadesCentroVerificadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'CentroVerificado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchRegistroEntidadesInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"MunicipalidadRegistrada"`
 */
export const useWatchRegistroEntidadesMunicipalidadRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'MunicipalidadRegistrada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchRegistroEntidadesRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchRegistroEntidadesRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchRegistroEntidadesRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchRegistroEntidadesUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"UsuarioRegistrado"`
 */
export const useWatchRegistroEntidadesUsuarioRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'UsuarioRegistrado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__
 */
export const useReadTransaccionesPlastico = /*#__PURE__*/ createUseReadContract(
  { abi: transaccionesPlasticoAbi },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadTransaccionesPlasticoDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useReadTransaccionesPlasticoPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadTransaccionesPlasticoUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"factorAjustePorTipo"`
 */
export const useReadTransaccionesPlasticoFactorAjustePorTipo =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'factorAjustePorTipo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadTransaccionesPlasticoGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"getTransaccionesPorDireccion"`
 */
export const useReadTransaccionesPlasticoGetTransaccionesPorDireccion =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'getTransaccionesPorDireccion',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadTransaccionesPlasticoHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"lotesMunicipales"`
 */
export const useReadTransaccionesPlasticoLotesMunicipales =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'lotesMunicipales',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"nextLoteId"`
 */
export const useReadTransaccionesPlasticoNextLoteId =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'nextLoteId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"nextTransaccionId"`
 */
export const useReadTransaccionesPlasticoNextTransaccionId =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'nextTransaccionId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"paused"`
 */
export const useReadTransaccionesPlasticoPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"pesoOficialPorTipo"`
 */
export const useReadTransaccionesPlasticoPesoOficialPorTipo =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'pesoOficialPorTipo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"plasticoToken"`
 */
export const useReadTransaccionesPlasticoPlasticoToken =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'plasticoToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadTransaccionesPlasticoProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registro"`
 */
export const useReadTransaccionesPlasticoRegistro =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registro',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"resumenTipoEnLote"`
 */
export const useReadTransaccionesPlasticoResumenTipoEnLote =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'resumenTipoEnLote',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadTransaccionesPlasticoSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"tipoReconciliadoDeLote"`
 */
export const useReadTransaccionesPlasticoTipoReconciliadoDeLote =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'tipoReconciliadoDeLote',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"transacciones"`
 */
export const useReadTransaccionesPlasticoTransacciones =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'transacciones',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"transaccionesPorDireccion"`
 */
export const useReadTransaccionesPlasticoTransaccionesPorDireccion =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'transaccionesPorDireccion',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"usdt"`
 */
export const useReadTransaccionesPlasticoUsdt =
  /*#__PURE__*/ createUseReadContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'usdt',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__
 */
export const useWriteTransaccionesPlastico =
  /*#__PURE__*/ createUseWriteContract({ abi: transaccionesPlasticoAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"cerrarLotePorTipo"`
 */
export const useWriteTransaccionesPlasticoCerrarLotePorTipo =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'cerrarLotePorTipo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteTransaccionesPlasticoGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"iniciarLoteMunicipal"`
 */
export const useWriteTransaccionesPlasticoIniciarLoteMunicipal =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'iniciarLoteMunicipal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteTransaccionesPlasticoInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteTransaccionesPlasticoPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaMunicipal"`
 */
export const useWriteTransaccionesPlasticoRegistrarEntregaMunicipal =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarEntregaMunicipal',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaUsuario"`
 */
export const useWriteTransaccionesPlasticoRegistrarEntregaUsuario =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarEntregaUsuario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionGratuita"`
 */
export const useWriteTransaccionesPlasticoRegistrarTransaccionGratuita =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarTransaccionGratuita',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionPagada"`
 */
export const useWriteTransaccionesPlasticoRegistrarTransaccionPagada =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarTransaccionPagada',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteTransaccionesPlasticoRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteTransaccionesPlasticoRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteTransaccionesPlasticoUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteTransaccionesPlasticoUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__
 */
export const useSimulateTransaccionesPlastico =
  /*#__PURE__*/ createUseSimulateContract({ abi: transaccionesPlasticoAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"cerrarLotePorTipo"`
 */
export const useSimulateTransaccionesPlasticoCerrarLotePorTipo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'cerrarLotePorTipo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateTransaccionesPlasticoGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"iniciarLoteMunicipal"`
 */
export const useSimulateTransaccionesPlasticoIniciarLoteMunicipal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'iniciarLoteMunicipal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateTransaccionesPlasticoInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateTransaccionesPlasticoPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaMunicipal"`
 */
export const useSimulateTransaccionesPlasticoRegistrarEntregaMunicipal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarEntregaMunicipal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarEntregaUsuario"`
 */
export const useSimulateTransaccionesPlasticoRegistrarEntregaUsuario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarEntregaUsuario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionGratuita"`
 */
export const useSimulateTransaccionesPlasticoRegistrarTransaccionGratuita =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarTransaccionGratuita',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"registrarTransaccionPagada"`
 */
export const useSimulateTransaccionesPlasticoRegistrarTransaccionPagada =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'registrarTransaccionPagada',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateTransaccionesPlasticoRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateTransaccionesPlasticoRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateTransaccionesPlasticoUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateTransaccionesPlasticoUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: transaccionesPlasticoAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__
 */
export const useWatchTransaccionesPlasticoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: transaccionesPlasticoAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchTransaccionesPlasticoInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"LoteMunicipalCerrado"`
 */
export const useWatchTransaccionesPlasticoLoteMunicipalCerradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'LoteMunicipalCerrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"LoteMunicipalIniciado"`
 */
export const useWatchTransaccionesPlasticoLoteMunicipalIniciadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'LoteMunicipalIniciado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"LoteTipoCerrado"`
 */
export const useWatchTransaccionesPlasticoLoteTipoCerradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'LoteTipoCerrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchTransaccionesPlasticoPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchTransaccionesPlasticoRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchTransaccionesPlasticoRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchTransaccionesPlasticoRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"TransaccionReconciliada"`
 */
export const useWatchTransaccionesPlasticoTransaccionReconciliadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'TransaccionReconciliada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"TransaccionRegistrada"`
 */
export const useWatchTransaccionesPlasticoTransaccionRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'TransaccionRegistrada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchTransaccionesPlasticoUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link transaccionesPlasticoAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchTransaccionesPlasticoUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: transaccionesPlasticoAbi,
    eventName: 'Upgraded',
  })
