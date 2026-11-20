import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CertificadoTransformacion
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const certificadoTransformacionAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
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
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
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
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
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
    inputs: [
      { name: 'nombre', internalType: 'string', type: 'string' },
      { name: 'simbolo', internalType: 'string', type: 'string' },
      { name: '_mercado', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mercado',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ICertificadoTransformacion
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iCertificadoTransformacionAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burn',
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
      {
        name: 'empresaObligadaLey9786',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'CompradorRegistrado',
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
      { name: 'rol', internalType: 'enum Rol', type: 'uint8', indexed: false },
      { name: 'por', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EntidadDesactivada',
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
      { name: 'rol', internalType: 'enum Rol', type: 'uint8', indexed: false },
      { name: 'por', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EntidadReactivada',
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
      { name: 'subtipo', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'IntermediarioRegistrado',
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
        name: 'verificador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'IntermediarioVerificado',
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
      {
        name: 'tipoSeparador',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'SeparadorRegistrado',
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
    name: 'TransformadorRegistrado',
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
        name: 'verificador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TransformadorVerificado',
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
      { name: 'rol', internalType: 'enum Rol', type: 'uint8', indexed: false },
      { name: 'por', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'VerificacionRevocada',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'desactivarEntidad',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esComprador',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esIntermediarioVerificado',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esSeparador',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esTransformadorVerificado',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'estaActiva',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'reactivarEntidad',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_empresaObligadaLey9786', internalType: 'bool', type: 'bool' },
    ],
    name: 'registrarComprador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
      { name: '_subtipo', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarIntermediario',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_identidadHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
      { name: '_tipoSeparador', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarSeparador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: '_cantonId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarTransformador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'revocarVerificacion',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'rolDe',
    outputs: [{ name: '', internalType: 'enum Rol', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'verificarIntermediario',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'verificarTransformador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ITokenCustodia
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iTokenCustodiaAbi = [
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
        name: 'separador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receptor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'varianteId',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'pesoGramos',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'modalidad',
        internalType: 'enum ModalidadEntrega',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'precioUSDTporKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EntregaRegistrada',
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
      { name: 'de', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'hacia',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoEnviado',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'precioUSDTporKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EnvioDeclarado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteConsolidadoId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'loteIdsOrigen',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'transformador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoActualTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pesoAceptadoOrigenTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LoteConsumido',
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
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'varianteId',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'custodioInicial',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LoteCreado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteIdOrigen',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'nuevosLoteIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'pesos',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'LoteDividido',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nuevoLoteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'loteIdsOrigen',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'pesosOrigen',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'varianteResultante',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'LoteUnido',
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
      { name: 'de', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'hacia',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoRecibido',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'merma',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'quienAbsorbe',
        internalType: 'enum QuienAbsorbe',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'RecepcionConfirmada',
  },
  {
    type: 'function',
    inputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    name: 'aportesDeLote',
    outputs: [
      { name: 'separadoresList', internalType: 'address[]', type: 'address[]' },
      { name: 'kgPorSeparador', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'loteIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'transformador', internalType: 'address', type: 'address' },
    ],
    name: 'consumirParaTransformacion',
    outputs: [
      { name: 'loteConsolidadoId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    name: 'loteInfo',
    outputs: [
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'varianteId', internalType: 'uint8', type: 'uint8' },
      { name: 'custodioActual', internalType: 'address', type: 'address' },
      { name: 'pesoActual', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoAceptadoOrigen', internalType: 'uint256', type: 'uint256' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    name: 'mermaDeLote',
    outputs: [
      {
        name: 'intermediariosList',
        internalType: 'address[]',
        type: 'address[]',
      },
      { name: 'gramosMerma', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MercadoCertificados
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mercadoCertificadosAbi = [
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
  { type: 'error', inputs: [], name: 'FailedDeployment' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
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
        name: 'emisionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'comprador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cantidadKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'valorTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CertificadoComprado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: true,
      },
      {
        name: 'clone',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nombre',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'simbolo',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'CertificadoDesplegado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'comprador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'cantidadKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'informeRef',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'periodo',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'CertificadoRetirado',
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
        name: 'emisionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'destinatario',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'monto',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PagoAcreditado',
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
        name: 'monto',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PagoRetirado',
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
      {
        name: 'anterior',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nueva',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PlataformaActualizada',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'emisionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'monto',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RemanenteRegistrado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'destino',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'monto',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RemanenteRescatado',
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
        name: 'emisionId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'transformador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'loteIdsConsumidos',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'loteConsolidadoId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pesoConsumidoTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'kgTransformados',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'mermaTransformador',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'precioUSDTporKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransformacionRegistrada',
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
    name: 'GRAMOS_POR_KG',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'aporteKgDeEmision',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'certificadoImplementacion',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'enum Material', type: 'uint8' }],
    name: 'certificados',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'emisionId', internalType: 'uint256', type: 'uint256' },
      { name: 'cantidadKg', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'comprarCertificado',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'nombre', internalType: 'string', type: 'string' },
      { name: 'simbolo', internalType: 'string', type: 'string' },
    ],
    name: 'desplegarCertificado',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'emisiones',
    outputs: [
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'transformador', internalType: 'address', type: 'address' },
      {
        name: 'kgTransformadosOriginal',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'kgDisponiblesPrimario',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'pesoAceptadoOrigenTotal',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'precioUSDTporKg', internalType: 'uint256', type: 'uint256' },
      { name: 'loteConsolidadoId', internalType: 'uint256', type: 'uint256' },
      { name: 'existe', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'emisionId', internalType: 'uint256', type: 'uint256' }],
    name: 'eslabonesDeEmision',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
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
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: '_registro', internalType: 'address', type: 'address' },
      { name: '_tokenCustodia', internalType: 'address', type: 'address' },
      { name: '_usdt', internalType: 'address', type: 'address' },
      {
        name: '_certificadoImplementacion',
        internalType: 'address',
        type: 'address',
      },
      { name: '_plataforma', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'mermaKgDeEmision',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextEmisionId',
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
    inputs: [],
    name: 'plataforma',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
      { name: 'loteIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'kgTransformados', internalType: 'uint256', type: 'uint256' },
      { name: 'precioUSDTporKg', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registrarTransformacion',
    outputs: [{ name: 'emisionId', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'remanenteNoAcreditado',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'destino', internalType: 'address', type: 'address' }],
    name: 'rescatarRemanente',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'cantidadKg', internalType: 'uint256', type: 'uint256' },
      { name: 'informeRef', internalType: 'bytes32', type: 'bytes32' },
      { name: 'periodo', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'retirarCertificado',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'destinatario', internalType: 'address', type: 'address' },
    ],
    name: 'retirarPago',
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'saldoPendiente',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'emisionId', internalType: 'uint256', type: 'uint256' }],
    name: 'separadoresDeEmision',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'nueva', internalType: 'address', type: 'address' }],
    name: 'setPlataforma',
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
    name: 'tokenCustodia',
    outputs: [
      { name: '', internalType: 'contract ITokenCustodia', type: 'address' },
    ],
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
      {
        name: 'empresaObligadaLey9786',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'CompradorRegistrado',
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
      { name: 'rol', internalType: 'enum Rol', type: 'uint8', indexed: false },
      { name: 'por', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EntidadDesactivada',
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
      { name: 'rol', internalType: 'enum Rol', type: 'uint8', indexed: false },
      { name: 'por', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'EntidadReactivada',
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
      { name: 'subtipo', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'IntermediarioRegistrado',
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
        name: 'verificador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'IntermediarioVerificado',
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
      {
        name: 'tipoSeparador',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'SeparadorRegistrado',
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
    name: 'TransformadorRegistrado',
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
        name: 'verificador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'TransformadorVerificado',
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
      { name: 'rol', internalType: 'enum Rol', type: 'uint8', indexed: false },
      { name: 'por', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'VerificacionRevocada',
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'compradores',
    outputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'empresaObligadaLey9786', internalType: 'bool', type: 'bool' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'registradoEn', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'desactivarEntidad',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esComprador',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esIntermediarioVerificado',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esSeparador',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'esTransformadorVerificado',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'estaActiva',
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
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'identidadHashToWallet',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    name: 'intermediarios',
    outputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'ubicacion',
        internalType: 'struct Ubicacion',
        type: 'tuple',
        components: [
          { name: 'provincia', internalType: 'enum Provincia', type: 'uint8' },
          { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
        ],
      },
      { name: 'subtipo', internalType: 'uint8', type: 'uint8' },
      { name: 'verificado', internalType: 'bool', type: 'bool' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'registradoEn', internalType: 'uint64', type: 'uint64' },
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
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'reactivarEntidad',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'empresaObligadaLey9786', internalType: 'bool', type: 'bool' },
    ],
    name: 'registrarComprador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
      { name: 'subtipo', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarIntermediario',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'identidadHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
      { name: 'tipoSeparador', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarSeparador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'provinciaId', internalType: 'uint8', type: 'uint8' },
      { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'registrarTransformador',
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
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'revocarVerificacion',
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'rolDe',
    outputs: [{ name: '', internalType: 'enum Rol', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'separadores',
    outputs: [
      { name: 'identidadHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'wallet', internalType: 'address', type: 'address' },
      {
        name: 'ubicacion',
        internalType: 'struct Ubicacion',
        type: 'tuple',
        components: [
          { name: 'provincia', internalType: 'enum Provincia', type: 'uint8' },
          { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
        ],
      },
      { name: 'tipoSeparador', internalType: 'uint8', type: 'uint8' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'registradoEn', internalType: 'uint64', type: 'uint64' },
    ],
    stateMutability: 'view',
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
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'transformadores',
    outputs: [
      { name: 'nombreHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'cedulaHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'ubicacion',
        internalType: 'struct Ubicacion',
        type: 'tuple',
        components: [
          { name: 'provincia', internalType: 'enum Provincia', type: 'uint8' },
          { name: 'cantonId', internalType: 'uint8', type: 'uint8' },
        ],
      },
      { name: 'verificado', internalType: 'bool', type: 'bool' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'registradoEn', internalType: 'uint64', type: 'uint64' },
    ],
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
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'verificarIntermediario',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'verificarTransformador',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TokenCustodia
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const tokenCustodiaAbi = [
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
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidApprover',
  },
  {
    type: 'error',
    inputs: [
      { name: 'idsLength', internalType: 'uint256', type: 'uint256' },
      { name: 'valuesLength', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC1155InvalidArrayLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC1155InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1155MissingApprovalForAll',
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
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
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
        name: 'separador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receptor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'varianteId',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'pesoGramos',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'modalidad',
        internalType: 'enum ModalidadEntrega',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'precioUSDTporKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EntregaRegistrada',
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
      { name: 'de', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'hacia',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoEnviado',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'precioUSDTporKg',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EnvioDeclarado',
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
        name: 'loteConsolidadoId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'loteIdsOrigen',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'transformador',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoActualTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pesoAceptadoOrigenTotal',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'LoteConsumido',
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
        name: 'material',
        internalType: 'enum Material',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'varianteId',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'custodioInicial',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'LoteCreado',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'loteIdOrigen',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'nuevosLoteIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'pesos',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'LoteDividido',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nuevoLoteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'loteIdsOrigen',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'pesosOrigen',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'varianteResultante',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'LoteUnido',
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
      {
        name: 'loteId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'de', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'hacia',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pesoRecibido',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'merma',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'quienAbsorbe',
        internalType: 'enum QuienAbsorbe',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'RecepcionConfirmada',
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
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'values',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'TransferBatch',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferSingle',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'value', internalType: 'string', type: 'string', indexed: false },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
    ],
    name: 'URI',
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
    name: 'MERCADO_ROLE',
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
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'aportePorSeparador',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    name: 'aportesDeLote',
    outputs: [
      { name: 'separadoresList', internalType: 'address[]', type: 'address[]' },
      { name: 'kgPorSeparador', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'accounts', internalType: 'address[]', type: 'address[]' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'loteId', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoRecibido', internalType: 'uint256', type: 'uint256' },
      {
        name: 'quienAbsorbe',
        internalType: 'enum QuienAbsorbe',
        type: 'uint8',
      },
    ],
    name: 'confirmarRecepcion',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'loteIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'transformador', internalType: 'address', type: 'address' },
    ],
    name: 'consumirParaTransformacion',
    outputs: [
      { name: 'loteConsolidadoId', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'loteId', internalType: 'uint256', type: 'uint256' },
      { name: 'destinatario', internalType: 'address', type: 'address' },
      { name: 'pesoEnviado', internalType: 'uint256', type: 'uint256' },
      { name: 'precioUSDTporKg', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'declararEnvio',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'loteId', internalType: 'uint256', type: 'uint256' },
      { name: 'pesos', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'dividirLote',
    outputs: [
      { name: 'nuevosLoteIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
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
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: '_registro', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    name: 'loteInfo',
    outputs: [
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'varianteId', internalType: 'uint8', type: 'uint8' },
      { name: 'custodioActual', internalType: 'address', type: 'address' },
      { name: 'pesoActual', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoAceptadoOrigen', internalType: 'uint256', type: 'uint256' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'lotes',
    outputs: [
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'varianteId', internalType: 'uint8', type: 'uint8' },
      { name: 'custodioActual', internalType: 'address', type: 'address' },
      { name: 'pesoActual', internalType: 'uint256', type: 'uint256' },
      { name: 'pesoAceptadoOrigen', internalType: 'uint256', type: 'uint256' },
      { name: 'activo', internalType: 'bool', type: 'bool' },
      { name: 'pendienteDeConfirmacion', internalType: 'bool', type: 'bool' },
      {
        name: 'destinatarioPendiente',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'pesoEnviadoPendiente',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'precioPendiente', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'mermaAtribuidaGramos',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
    name: 'mermaDeLote',
    outputs: [
      {
        name: 'intermediariosList',
        internalType: 'address[]',
        type: 'address[]',
      },
      { name: 'gramosMerma', internalType: 'uint256[]', type: 'uint256[]' },
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
      { name: 'separador', internalType: 'address', type: 'address' },
      { name: 'material', internalType: 'enum Material', type: 'uint8' },
      { name: 'varianteId', internalType: 'uint8', type: 'uint8' },
      { name: 'pesoGramos', internalType: 'uint256', type: 'uint256' },
      { name: 'loteDestino', internalType: 'uint256', type: 'uint256' },
      {
        name: 'modalidad',
        internalType: 'enum ModalidadEntrega',
        type: 'uint8',
      },
      { name: 'precioUSDTporKg', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'registrarEntrega',
    outputs: [{ name: 'loteId', internalType: 'uint256', type: 'uint256' }],
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
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
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
      { name: 'loteIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'varianteResultante', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'unirLotes',
    outputs: [
      { name: 'nuevoLoteId', internalType: 'uint256', type: 'uint256' },
    ],
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
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'uri',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__
 */
export const useReadCertificadoTransformacion =
  /*#__PURE__*/ createUseReadContract({ abi: certificadoTransformacionAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadCertificadoTransformacionAllowance =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'allowance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadCertificadoTransformacionBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadCertificadoTransformacionDecimals =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'decimals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"mercado"`
 */
export const useReadCertificadoTransformacionMercado =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'mercado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"name"`
 */
export const useReadCertificadoTransformacionName =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'name',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadCertificadoTransformacionSymbol =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'symbol',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadCertificadoTransformacionTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: certificadoTransformacionAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__
 */
export const useWriteCertificadoTransformacion =
  /*#__PURE__*/ createUseWriteContract({ abi: certificadoTransformacionAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteCertificadoTransformacionApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: certificadoTransformacionAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteCertificadoTransformacionBurn =
  /*#__PURE__*/ createUseWriteContract({
    abi: certificadoTransformacionAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteCertificadoTransformacionInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: certificadoTransformacionAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteCertificadoTransformacionMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: certificadoTransformacionAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteCertificadoTransformacionTransfer =
  /*#__PURE__*/ createUseWriteContract({
    abi: certificadoTransformacionAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteCertificadoTransformacionTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: certificadoTransformacionAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__
 */
export const useSimulateCertificadoTransformacion =
  /*#__PURE__*/ createUseSimulateContract({ abi: certificadoTransformacionAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateCertificadoTransformacionApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: certificadoTransformacionAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateCertificadoTransformacionBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: certificadoTransformacionAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateCertificadoTransformacionInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: certificadoTransformacionAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateCertificadoTransformacionMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: certificadoTransformacionAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateCertificadoTransformacionTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: certificadoTransformacionAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateCertificadoTransformacionTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: certificadoTransformacionAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link certificadoTransformacionAbi}__
 */
export const useWatchCertificadoTransformacionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: certificadoTransformacionAbi,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchCertificadoTransformacionApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: certificadoTransformacionAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchCertificadoTransformacionInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: certificadoTransformacionAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link certificadoTransformacionAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchCertificadoTransformacionTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: certificadoTransformacionAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCertificadoTransformacionAbi}__
 */
export const useWriteICertificadoTransformacion =
  /*#__PURE__*/ createUseWriteContract({ abi: iCertificadoTransformacionAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCertificadoTransformacionAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteICertificadoTransformacionBurn =
  /*#__PURE__*/ createUseWriteContract({
    abi: iCertificadoTransformacionAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iCertificadoTransformacionAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteICertificadoTransformacionMint =
  /*#__PURE__*/ createUseWriteContract({
    abi: iCertificadoTransformacionAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCertificadoTransformacionAbi}__
 */
export const useSimulateICertificadoTransformacion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iCertificadoTransformacionAbi,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCertificadoTransformacionAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateICertificadoTransformacionBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iCertificadoTransformacionAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iCertificadoTransformacionAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateICertificadoTransformacionMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iCertificadoTransformacionAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useReadIRegistroEntidades = /*#__PURE__*/ createUseReadContract({
  abi: iRegistroEntidadesAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esComprador"`
 */
export const useReadIRegistroEntidadesEsComprador =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esComprador',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esIntermediarioVerificado"`
 */
export const useReadIRegistroEntidadesEsIntermediarioVerificado =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esIntermediarioVerificado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esSeparador"`
 */
export const useReadIRegistroEntidadesEsSeparador =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esSeparador',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"esTransformadorVerificado"`
 */
export const useReadIRegistroEntidadesEsTransformadorVerificado =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'esTransformadorVerificado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"estaActiva"`
 */
export const useReadIRegistroEntidadesEstaActiva =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'estaActiva',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"rolDe"`
 */
export const useReadIRegistroEntidadesRolDe =
  /*#__PURE__*/ createUseReadContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'rolDe',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useWriteIRegistroEntidades = /*#__PURE__*/ createUseWriteContract({
  abi: iRegistroEntidadesAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"desactivarEntidad"`
 */
export const useWriteIRegistroEntidadesDesactivarEntidad =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'desactivarEntidad',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"reactivarEntidad"`
 */
export const useWriteIRegistroEntidadesReactivarEntidad =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'reactivarEntidad',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarComprador"`
 */
export const useWriteIRegistroEntidadesRegistrarComprador =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarComprador',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarIntermediario"`
 */
export const useWriteIRegistroEntidadesRegistrarIntermediario =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarIntermediario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarSeparador"`
 */
export const useWriteIRegistroEntidadesRegistrarSeparador =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarSeparador',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarTransformador"`
 */
export const useWriteIRegistroEntidadesRegistrarTransformador =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarTransformador',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"revocarVerificacion"`
 */
export const useWriteIRegistroEntidadesRevocarVerificacion =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'revocarVerificacion',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"verificarIntermediario"`
 */
export const useWriteIRegistroEntidadesVerificarIntermediario =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'verificarIntermediario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"verificarTransformador"`
 */
export const useWriteIRegistroEntidadesVerificarTransformador =
  /*#__PURE__*/ createUseWriteContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'verificarTransformador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useSimulateIRegistroEntidades =
  /*#__PURE__*/ createUseSimulateContract({ abi: iRegistroEntidadesAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"desactivarEntidad"`
 */
export const useSimulateIRegistroEntidadesDesactivarEntidad =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'desactivarEntidad',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"reactivarEntidad"`
 */
export const useSimulateIRegistroEntidadesReactivarEntidad =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'reactivarEntidad',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarComprador"`
 */
export const useSimulateIRegistroEntidadesRegistrarComprador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarComprador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarIntermediario"`
 */
export const useSimulateIRegistroEntidadesRegistrarIntermediario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarIntermediario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarSeparador"`
 */
export const useSimulateIRegistroEntidadesRegistrarSeparador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarSeparador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"registrarTransformador"`
 */
export const useSimulateIRegistroEntidadesRegistrarTransformador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'registrarTransformador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"revocarVerificacion"`
 */
export const useSimulateIRegistroEntidadesRevocarVerificacion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'revocarVerificacion',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"verificarIntermediario"`
 */
export const useSimulateIRegistroEntidadesVerificarIntermediario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'verificarIntermediario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `functionName` set to `"verificarTransformador"`
 */
export const useSimulateIRegistroEntidadesVerificarTransformador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iRegistroEntidadesAbi,
    functionName: 'verificarTransformador',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__
 */
export const useWatchIRegistroEntidadesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iRegistroEntidadesAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"CompradorRegistrado"`
 */
export const useWatchIRegistroEntidadesCompradorRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'CompradorRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"EntidadDesactivada"`
 */
export const useWatchIRegistroEntidadesEntidadDesactivadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'EntidadDesactivada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"EntidadReactivada"`
 */
export const useWatchIRegistroEntidadesEntidadReactivadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'EntidadReactivada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"IntermediarioRegistrado"`
 */
export const useWatchIRegistroEntidadesIntermediarioRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'IntermediarioRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"IntermediarioVerificado"`
 */
export const useWatchIRegistroEntidadesIntermediarioVerificadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'IntermediarioVerificado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"SeparadorRegistrado"`
 */
export const useWatchIRegistroEntidadesSeparadorRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'SeparadorRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"TransformadorRegistrado"`
 */
export const useWatchIRegistroEntidadesTransformadorRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'TransformadorRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"TransformadorVerificado"`
 */
export const useWatchIRegistroEntidadesTransformadorVerificadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'TransformadorVerificado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iRegistroEntidadesAbi}__ and `eventName` set to `"VerificacionRevocada"`
 */
export const useWatchIRegistroEntidadesVerificacionRevocadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iRegistroEntidadesAbi,
    eventName: 'VerificacionRevocada',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__
 */
export const useReadITokenCustodia = /*#__PURE__*/ createUseReadContract({
  abi: iTokenCustodiaAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `functionName` set to `"aportesDeLote"`
 */
export const useReadITokenCustodiaAportesDeLote =
  /*#__PURE__*/ createUseReadContract({
    abi: iTokenCustodiaAbi,
    functionName: 'aportesDeLote',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `functionName` set to `"loteInfo"`
 */
export const useReadITokenCustodiaLoteInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: iTokenCustodiaAbi,
    functionName: 'loteInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `functionName` set to `"mermaDeLote"`
 */
export const useReadITokenCustodiaMermaDeLote =
  /*#__PURE__*/ createUseReadContract({
    abi: iTokenCustodiaAbi,
    functionName: 'mermaDeLote',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__
 */
export const useWriteITokenCustodia = /*#__PURE__*/ createUseWriteContract({
  abi: iTokenCustodiaAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `functionName` set to `"consumirParaTransformacion"`
 */
export const useWriteITokenCustodiaConsumirParaTransformacion =
  /*#__PURE__*/ createUseWriteContract({
    abi: iTokenCustodiaAbi,
    functionName: 'consumirParaTransformacion',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__
 */
export const useSimulateITokenCustodia =
  /*#__PURE__*/ createUseSimulateContract({ abi: iTokenCustodiaAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `functionName` set to `"consumirParaTransformacion"`
 */
export const useSimulateITokenCustodiaConsumirParaTransformacion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: iTokenCustodiaAbi,
    functionName: 'consumirParaTransformacion',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__
 */
export const useWatchITokenCustodiaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: iTokenCustodiaAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"EntregaRegistrada"`
 */
export const useWatchITokenCustodiaEntregaRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'EntregaRegistrada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"EnvioDeclarado"`
 */
export const useWatchITokenCustodiaEnvioDeclaradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'EnvioDeclarado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"LoteConsumido"`
 */
export const useWatchITokenCustodiaLoteConsumidoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'LoteConsumido',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"LoteCreado"`
 */
export const useWatchITokenCustodiaLoteCreadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'LoteCreado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"LoteDividido"`
 */
export const useWatchITokenCustodiaLoteDivididoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'LoteDividido',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"LoteUnido"`
 */
export const useWatchITokenCustodiaLoteUnidoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'LoteUnido',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link iTokenCustodiaAbi}__ and `eventName` set to `"RecepcionConfirmada"`
 */
export const useWatchITokenCustodiaRecepcionConfirmadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: iTokenCustodiaAbi,
    eventName: 'RecepcionConfirmada',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__
 */
export const useReadMercadoCertificados = /*#__PURE__*/ createUseReadContract({
  abi: mercadoCertificadosAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadMercadoCertificadosDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"GRAMOS_POR_KG"`
 */
export const useReadMercadoCertificadosGramosPorKg =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'GRAMOS_POR_KG',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useReadMercadoCertificadosPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadMercadoCertificadosUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"aporteKgDeEmision"`
 */
export const useReadMercadoCertificadosAporteKgDeEmision =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'aporteKgDeEmision',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"certificadoImplementacion"`
 */
export const useReadMercadoCertificadosCertificadoImplementacion =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'certificadoImplementacion',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"certificados"`
 */
export const useReadMercadoCertificadosCertificados =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'certificados',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"emisiones"`
 */
export const useReadMercadoCertificadosEmisiones =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'emisiones',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"eslabonesDeEmision"`
 */
export const useReadMercadoCertificadosEslabonesDeEmision =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'eslabonesDeEmision',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadMercadoCertificadosGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadMercadoCertificadosHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"mermaKgDeEmision"`
 */
export const useReadMercadoCertificadosMermaKgDeEmision =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'mermaKgDeEmision',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"nextEmisionId"`
 */
export const useReadMercadoCertificadosNextEmisionId =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'nextEmisionId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"paused"`
 */
export const useReadMercadoCertificadosPaused =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'paused',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"plataforma"`
 */
export const useReadMercadoCertificadosPlataforma =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'plataforma',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadMercadoCertificadosProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"registro"`
 */
export const useReadMercadoCertificadosRegistro =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'registro',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"remanenteNoAcreditado"`
 */
export const useReadMercadoCertificadosRemanenteNoAcreditado =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'remanenteNoAcreditado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"saldoPendiente"`
 */
export const useReadMercadoCertificadosSaldoPendiente =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'saldoPendiente',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"separadoresDeEmision"`
 */
export const useReadMercadoCertificadosSeparadoresDeEmision =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'separadoresDeEmision',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadMercadoCertificadosSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"tokenCustodia"`
 */
export const useReadMercadoCertificadosTokenCustodia =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'tokenCustodia',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"usdt"`
 */
export const useReadMercadoCertificadosUsdt =
  /*#__PURE__*/ createUseReadContract({
    abi: mercadoCertificadosAbi,
    functionName: 'usdt',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__
 */
export const useWriteMercadoCertificados = /*#__PURE__*/ createUseWriteContract(
  { abi: mercadoCertificadosAbi },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"comprarCertificado"`
 */
export const useWriteMercadoCertificadosComprarCertificado =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'comprarCertificado',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"desplegarCertificado"`
 */
export const useWriteMercadoCertificadosDesplegarCertificado =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'desplegarCertificado',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteMercadoCertificadosGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteMercadoCertificadosInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteMercadoCertificadosPause =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"registrarTransformacion"`
 */
export const useWriteMercadoCertificadosRegistrarTransformacion =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'registrarTransformacion',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteMercadoCertificadosRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"rescatarRemanente"`
 */
export const useWriteMercadoCertificadosRescatarRemanente =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'rescatarRemanente',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"retirarCertificado"`
 */
export const useWriteMercadoCertificadosRetirarCertificado =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'retirarCertificado',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"retirarPago"`
 */
export const useWriteMercadoCertificadosRetirarPago =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'retirarPago',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteMercadoCertificadosRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"setPlataforma"`
 */
export const useWriteMercadoCertificadosSetPlataforma =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'setPlataforma',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteMercadoCertificadosUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteMercadoCertificadosUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: mercadoCertificadosAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__
 */
export const useSimulateMercadoCertificados =
  /*#__PURE__*/ createUseSimulateContract({ abi: mercadoCertificadosAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"comprarCertificado"`
 */
export const useSimulateMercadoCertificadosComprarCertificado =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'comprarCertificado',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"desplegarCertificado"`
 */
export const useSimulateMercadoCertificadosDesplegarCertificado =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'desplegarCertificado',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateMercadoCertificadosGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateMercadoCertificadosInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateMercadoCertificadosPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"registrarTransformacion"`
 */
export const useSimulateMercadoCertificadosRegistrarTransformacion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'registrarTransformacion',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateMercadoCertificadosRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"rescatarRemanente"`
 */
export const useSimulateMercadoCertificadosRescatarRemanente =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'rescatarRemanente',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"retirarCertificado"`
 */
export const useSimulateMercadoCertificadosRetirarCertificado =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'retirarCertificado',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"retirarPago"`
 */
export const useSimulateMercadoCertificadosRetirarPago =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'retirarPago',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateMercadoCertificadosRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"setPlataforma"`
 */
export const useSimulateMercadoCertificadosSetPlataforma =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'setPlataforma',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateMercadoCertificadosUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateMercadoCertificadosUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mercadoCertificadosAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__
 */
export const useWatchMercadoCertificadosEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: mercadoCertificadosAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"CertificadoComprado"`
 */
export const useWatchMercadoCertificadosCertificadoCompradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'CertificadoComprado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"CertificadoDesplegado"`
 */
export const useWatchMercadoCertificadosCertificadoDesplegadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'CertificadoDesplegado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"CertificadoRetirado"`
 */
export const useWatchMercadoCertificadosCertificadoRetiradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'CertificadoRetirado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchMercadoCertificadosInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"PagoAcreditado"`
 */
export const useWatchMercadoCertificadosPagoAcreditadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'PagoAcreditado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"PagoRetirado"`
 */
export const useWatchMercadoCertificadosPagoRetiradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'PagoRetirado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchMercadoCertificadosPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"PlataformaActualizada"`
 */
export const useWatchMercadoCertificadosPlataformaActualizadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'PlataformaActualizada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"RemanenteRegistrado"`
 */
export const useWatchMercadoCertificadosRemanenteRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'RemanenteRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"RemanenteRescatado"`
 */
export const useWatchMercadoCertificadosRemanenteRescatadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'RemanenteRescatado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchMercadoCertificadosRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchMercadoCertificadosRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchMercadoCertificadosRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"TransformacionRegistrada"`
 */
export const useWatchMercadoCertificadosTransformacionRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'TransformacionRegistrada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchMercadoCertificadosUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mercadoCertificadosAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchMercadoCertificadosUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mercadoCertificadosAbi,
    eventName: 'Upgraded',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"compradores"`
 */
export const useReadRegistroEntidadesCompradores =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'compradores',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esComprador"`
 */
export const useReadRegistroEntidadesEsComprador =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esComprador',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esIntermediarioVerificado"`
 */
export const useReadRegistroEntidadesEsIntermediarioVerificado =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esIntermediarioVerificado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esSeparador"`
 */
export const useReadRegistroEntidadesEsSeparador =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esSeparador',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"esTransformadorVerificado"`
 */
export const useReadRegistroEntidadesEsTransformadorVerificado =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'esTransformadorVerificado',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"estaActiva"`
 */
export const useReadRegistroEntidadesEstaActiva =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'estaActiva',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"identidadHashToWallet"`
 */
export const useReadRegistroEntidadesIdentidadHashToWallet =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'identidadHashToWallet',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"intermediarios"`
 */
export const useReadRegistroEntidadesIntermediarios =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'intermediarios',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"rolDe"`
 */
export const useReadRegistroEntidadesRolDe =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'rolDe',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"separadores"`
 */
export const useReadRegistroEntidadesSeparadores =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'separadores',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"transformadores"`
 */
export const useReadRegistroEntidadesTransformadores =
  /*#__PURE__*/ createUseReadContract({
    abi: registroEntidadesAbi,
    functionName: 'transformadores',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useWriteRegistroEntidades = /*#__PURE__*/ createUseWriteContract({
  abi: registroEntidadesAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"desactivarEntidad"`
 */
export const useWriteRegistroEntidadesDesactivarEntidad =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'desactivarEntidad',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"reactivarEntidad"`
 */
export const useWriteRegistroEntidadesReactivarEntidad =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'reactivarEntidad',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarComprador"`
 */
export const useWriteRegistroEntidadesRegistrarComprador =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarComprador',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarIntermediario"`
 */
export const useWriteRegistroEntidadesRegistrarIntermediario =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarIntermediario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarSeparador"`
 */
export const useWriteRegistroEntidadesRegistrarSeparador =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarSeparador',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarTransformador"`
 */
export const useWriteRegistroEntidadesRegistrarTransformador =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarTransformador',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"revocarVerificacion"`
 */
export const useWriteRegistroEntidadesRevocarVerificacion =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'revocarVerificacion',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"verificarIntermediario"`
 */
export const useWriteRegistroEntidadesVerificarIntermediario =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'verificarIntermediario',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"verificarTransformador"`
 */
export const useWriteRegistroEntidadesVerificarTransformador =
  /*#__PURE__*/ createUseWriteContract({
    abi: registroEntidadesAbi,
    functionName: 'verificarTransformador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useSimulateRegistroEntidades =
  /*#__PURE__*/ createUseSimulateContract({ abi: registroEntidadesAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"desactivarEntidad"`
 */
export const useSimulateRegistroEntidadesDesactivarEntidad =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'desactivarEntidad',
  })

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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"reactivarEntidad"`
 */
export const useSimulateRegistroEntidadesReactivarEntidad =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'reactivarEntidad',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarComprador"`
 */
export const useSimulateRegistroEntidadesRegistrarComprador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarComprador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarIntermediario"`
 */
export const useSimulateRegistroEntidadesRegistrarIntermediario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarIntermediario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarSeparador"`
 */
export const useSimulateRegistroEntidadesRegistrarSeparador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarSeparador',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"registrarTransformador"`
 */
export const useSimulateRegistroEntidadesRegistrarTransformador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'registrarTransformador',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"revocarVerificacion"`
 */
export const useSimulateRegistroEntidadesRevocarVerificacion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'revocarVerificacion',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"verificarIntermediario"`
 */
export const useSimulateRegistroEntidadesVerificarIntermediario =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'verificarIntermediario',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link registroEntidadesAbi}__ and `functionName` set to `"verificarTransformador"`
 */
export const useSimulateRegistroEntidadesVerificarTransformador =
  /*#__PURE__*/ createUseSimulateContract({
    abi: registroEntidadesAbi,
    functionName: 'verificarTransformador',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__
 */
export const useWatchRegistroEntidadesEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: registroEntidadesAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"CompradorRegistrado"`
 */
export const useWatchRegistroEntidadesCompradorRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'CompradorRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"EntidadDesactivada"`
 */
export const useWatchRegistroEntidadesEntidadDesactivadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'EntidadDesactivada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"EntidadReactivada"`
 */
export const useWatchRegistroEntidadesEntidadReactivadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'EntidadReactivada',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"IntermediarioRegistrado"`
 */
export const useWatchRegistroEntidadesIntermediarioRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'IntermediarioRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"IntermediarioVerificado"`
 */
export const useWatchRegistroEntidadesIntermediarioVerificadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'IntermediarioVerificado',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"SeparadorRegistrado"`
 */
export const useWatchRegistroEntidadesSeparadorRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'SeparadorRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"TransformadorRegistrado"`
 */
export const useWatchRegistroEntidadesTransformadorRegistradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'TransformadorRegistrado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"TransformadorVerificado"`
 */
export const useWatchRegistroEntidadesTransformadorVerificadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'TransformadorVerificado',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link registroEntidadesAbi}__ and `eventName` set to `"VerificacionRevocada"`
 */
export const useWatchRegistroEntidadesVerificacionRevocadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: registroEntidadesAbi,
    eventName: 'VerificacionRevocada',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__
 */
export const useReadTokenCustodia = /*#__PURE__*/ createUseReadContract({
  abi: tokenCustodiaAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadTokenCustodiaDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"MERCADO_ROLE"`
 */
export const useReadTokenCustodiaMercadoRole =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'MERCADO_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"PAUSER_ROLE"`
 */
export const useReadTokenCustodiaPauserRole =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'PAUSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadTokenCustodiaUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"aportePorSeparador"`
 */
export const useReadTokenCustodiaAportePorSeparador =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'aportePorSeparador',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"aportesDeLote"`
 */
export const useReadTokenCustodiaAportesDeLote =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'aportesDeLote',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadTokenCustodiaBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const useReadTokenCustodiaBalanceOfBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'balanceOfBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadTokenCustodiaGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadTokenCustodiaHasRole = /*#__PURE__*/ createUseReadContract({
  abi: tokenCustodiaAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadTokenCustodiaIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"loteInfo"`
 */
export const useReadTokenCustodiaLoteInfo = /*#__PURE__*/ createUseReadContract(
  { abi: tokenCustodiaAbi, functionName: 'loteInfo' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"lotes"`
 */
export const useReadTokenCustodiaLotes = /*#__PURE__*/ createUseReadContract({
  abi: tokenCustodiaAbi,
  functionName: 'lotes',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"mermaAtribuidaGramos"`
 */
export const useReadTokenCustodiaMermaAtribuidaGramos =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'mermaAtribuidaGramos',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"mermaDeLote"`
 */
export const useReadTokenCustodiaMermaDeLote =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'mermaDeLote',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"nextLoteId"`
 */
export const useReadTokenCustodiaNextLoteId =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'nextLoteId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"paused"`
 */
export const useReadTokenCustodiaPaused = /*#__PURE__*/ createUseReadContract({
  abi: tokenCustodiaAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadTokenCustodiaProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"registro"`
 */
export const useReadTokenCustodiaRegistro = /*#__PURE__*/ createUseReadContract(
  { abi: tokenCustodiaAbi, functionName: 'registro' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadTokenCustodiaSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: tokenCustodiaAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"uri"`
 */
export const useReadTokenCustodiaUri = /*#__PURE__*/ createUseReadContract({
  abi: tokenCustodiaAbi,
  functionName: 'uri',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__
 */
export const useWriteTokenCustodia = /*#__PURE__*/ createUseWriteContract({
  abi: tokenCustodiaAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"confirmarRecepcion"`
 */
export const useWriteTokenCustodiaConfirmarRecepcion =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'confirmarRecepcion',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"consumirParaTransformacion"`
 */
export const useWriteTokenCustodiaConsumirParaTransformacion =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'consumirParaTransformacion',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"declararEnvio"`
 */
export const useWriteTokenCustodiaDeclararEnvio =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'declararEnvio',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"dividirLote"`
 */
export const useWriteTokenCustodiaDividirLote =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'dividirLote',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteTokenCustodiaGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteTokenCustodiaInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteTokenCustodiaPause = /*#__PURE__*/ createUseWriteContract({
  abi: tokenCustodiaAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"registrarEntrega"`
 */
export const useWriteTokenCustodiaRegistrarEntrega =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'registrarEntrega',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteTokenCustodiaRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteTokenCustodiaRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useWriteTokenCustodiaSafeBatchTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteTokenCustodiaSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteTokenCustodiaSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"unirLotes"`
 */
export const useWriteTokenCustodiaUnirLotes =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'unirLotes',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteTokenCustodiaUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteTokenCustodiaUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: tokenCustodiaAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__
 */
export const useSimulateTokenCustodia = /*#__PURE__*/ createUseSimulateContract(
  { abi: tokenCustodiaAbi },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"confirmarRecepcion"`
 */
export const useSimulateTokenCustodiaConfirmarRecepcion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'confirmarRecepcion',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"consumirParaTransformacion"`
 */
export const useSimulateTokenCustodiaConsumirParaTransformacion =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'consumirParaTransformacion',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"declararEnvio"`
 */
export const useSimulateTokenCustodiaDeclararEnvio =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'declararEnvio',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"dividirLote"`
 */
export const useSimulateTokenCustodiaDividirLote =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'dividirLote',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateTokenCustodiaGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateTokenCustodiaInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateTokenCustodiaPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"registrarEntrega"`
 */
export const useSimulateTokenCustodiaRegistrarEntrega =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'registrarEntrega',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateTokenCustodiaRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateTokenCustodiaRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSimulateTokenCustodiaSafeBatchTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateTokenCustodiaSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateTokenCustodiaSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"unirLotes"`
 */
export const useSimulateTokenCustodiaUnirLotes =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'unirLotes',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateTokenCustodiaUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateTokenCustodiaUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: tokenCustodiaAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__
 */
export const useWatchTokenCustodiaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: tokenCustodiaAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchTokenCustodiaApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"EntregaRegistrada"`
 */
export const useWatchTokenCustodiaEntregaRegistradaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'EntregaRegistrada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"EnvioDeclarado"`
 */
export const useWatchTokenCustodiaEnvioDeclaradoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'EnvioDeclarado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchTokenCustodiaInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"LoteConsumido"`
 */
export const useWatchTokenCustodiaLoteConsumidoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'LoteConsumido',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"LoteCreado"`
 */
export const useWatchTokenCustodiaLoteCreadoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'LoteCreado',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"LoteDividido"`
 */
export const useWatchTokenCustodiaLoteDivididoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'LoteDividido',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"LoteUnido"`
 */
export const useWatchTokenCustodiaLoteUnidoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'LoteUnido',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchTokenCustodiaPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"RecepcionConfirmada"`
 */
export const useWatchTokenCustodiaRecepcionConfirmadaEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'RecepcionConfirmada',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchTokenCustodiaRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchTokenCustodiaRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchTokenCustodiaRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const useWatchTokenCustodiaTransferBatchEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'TransferBatch',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const useWatchTokenCustodiaTransferSingleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'TransferSingle',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"URI"`
 */
export const useWatchTokenCustodiaUriEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'URI',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchTokenCustodiaUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link tokenCustodiaAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchTokenCustodiaUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: tokenCustodiaAbi,
    eventName: 'Upgraded',
  })
