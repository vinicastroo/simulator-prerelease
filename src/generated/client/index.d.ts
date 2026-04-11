
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Card
 * 
 */
export type Card = $Result.DefaultSelection<Prisma.$CardPayload>
/**
 * Model PrereleaseKit
 * 
 */
export type PrereleaseKit = $Result.DefaultSelection<Prisma.$PrereleaseKitPayload>
/**
 * Model PlacedCard
 * 
 */
export type PlacedCard = $Result.DefaultSelection<Prisma.$PlacedCardPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Rarity: {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  MYTHIC: 'MYTHIC'
};

export type Rarity = (typeof Rarity)[keyof typeof Rarity]


export const CardSet: {
  SOS: 'SOS',
  SOA: 'SOA',
  SPG: 'SPG'
};

export type CardSet = (typeof CardSet)[keyof typeof CardSet]


export const College: {
  LOREHOLD: 'LOREHOLD',
  PRISMARI: 'PRISMARI',
  QUANDRIX: 'QUANDRIX',
  SILVERQUILL: 'SILVERQUILL',
  WITHERBLOOM: 'WITHERBLOOM'
};

export type College = (typeof College)[keyof typeof College]

}

export type Rarity = $Enums.Rarity

export const Rarity: typeof $Enums.Rarity

export type CardSet = $Enums.CardSet

export const CardSet: typeof $Enums.CardSet

export type College = $Enums.College

export const College: typeof $Enums.College

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Cards
 * const cards = await prisma.card.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Cards
   * const cards = await prisma.card.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.card`: Exposes CRUD operations for the **Card** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cards
    * const cards = await prisma.card.findMany()
    * ```
    */
  get card(): Prisma.CardDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.prereleaseKit`: Exposes CRUD operations for the **PrereleaseKit** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PrereleaseKits
    * const prereleaseKits = await prisma.prereleaseKit.findMany()
    * ```
    */
  get prereleaseKit(): Prisma.PrereleaseKitDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.placedCard`: Exposes CRUD operations for the **PlacedCard** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlacedCards
    * const placedCards = await prisma.placedCard.findMany()
    * ```
    */
  get placedCard(): Prisma.PlacedCardDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.7.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Card: 'Card',
    PrereleaseKit: 'PrereleaseKit',
    PlacedCard: 'PlacedCard'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "card" | "prereleaseKit" | "placedCard"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Card: {
        payload: Prisma.$CardPayload<ExtArgs>
        fields: Prisma.CardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          findFirst: {
            args: Prisma.CardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          findMany: {
            args: Prisma.CardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          create: {
            args: Prisma.CardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          createMany: {
            args: Prisma.CardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          delete: {
            args: Prisma.CardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          update: {
            args: Prisma.CardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          deleteMany: {
            args: Prisma.CardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>[]
          }
          upsert: {
            args: Prisma.CardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CardPayload>
          }
          aggregate: {
            args: Prisma.CardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCard>
          }
          groupBy: {
            args: Prisma.CardGroupByArgs<ExtArgs>
            result: $Utils.Optional<CardGroupByOutputType>[]
          }
          count: {
            args: Prisma.CardCountArgs<ExtArgs>
            result: $Utils.Optional<CardCountAggregateOutputType> | number
          }
        }
      }
      PrereleaseKit: {
        payload: Prisma.$PrereleaseKitPayload<ExtArgs>
        fields: Prisma.PrereleaseKitFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PrereleaseKitFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PrereleaseKitFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>
          }
          findFirst: {
            args: Prisma.PrereleaseKitFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PrereleaseKitFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>
          }
          findMany: {
            args: Prisma.PrereleaseKitFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>[]
          }
          create: {
            args: Prisma.PrereleaseKitCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>
          }
          createMany: {
            args: Prisma.PrereleaseKitCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PrereleaseKitCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>[]
          }
          delete: {
            args: Prisma.PrereleaseKitDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>
          }
          update: {
            args: Prisma.PrereleaseKitUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>
          }
          deleteMany: {
            args: Prisma.PrereleaseKitDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PrereleaseKitUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PrereleaseKitUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>[]
          }
          upsert: {
            args: Prisma.PrereleaseKitUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PrereleaseKitPayload>
          }
          aggregate: {
            args: Prisma.PrereleaseKitAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePrereleaseKit>
          }
          groupBy: {
            args: Prisma.PrereleaseKitGroupByArgs<ExtArgs>
            result: $Utils.Optional<PrereleaseKitGroupByOutputType>[]
          }
          count: {
            args: Prisma.PrereleaseKitCountArgs<ExtArgs>
            result: $Utils.Optional<PrereleaseKitCountAggregateOutputType> | number
          }
        }
      }
      PlacedCard: {
        payload: Prisma.$PlacedCardPayload<ExtArgs>
        fields: Prisma.PlacedCardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlacedCardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlacedCardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>
          }
          findFirst: {
            args: Prisma.PlacedCardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlacedCardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>
          }
          findMany: {
            args: Prisma.PlacedCardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>[]
          }
          create: {
            args: Prisma.PlacedCardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>
          }
          createMany: {
            args: Prisma.PlacedCardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlacedCardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>[]
          }
          delete: {
            args: Prisma.PlacedCardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>
          }
          update: {
            args: Prisma.PlacedCardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>
          }
          deleteMany: {
            args: Prisma.PlacedCardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlacedCardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PlacedCardUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>[]
          }
          upsert: {
            args: Prisma.PlacedCardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacedCardPayload>
          }
          aggregate: {
            args: Prisma.PlacedCardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlacedCard>
          }
          groupBy: {
            args: Prisma.PlacedCardGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlacedCardGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlacedCardCountArgs<ExtArgs>
            result: $Utils.Optional<PlacedCardCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    card?: CardOmit
    prereleaseKit?: PrereleaseKitOmit
    placedCard?: PlacedCardOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CardCountOutputType
   */

  export type CardCountOutputType = {
    placedCards: number
    promoInKits: number
  }

  export type CardCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    placedCards?: boolean | CardCountOutputTypeCountPlacedCardsArgs
    promoInKits?: boolean | CardCountOutputTypeCountPromoInKitsArgs
  }

  // Custom InputTypes
  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CardCountOutputType
     */
    select?: CardCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeCountPlacedCardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlacedCardWhereInput
  }

  /**
   * CardCountOutputType without action
   */
  export type CardCountOutputTypeCountPromoInKitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PrereleaseKitWhereInput
  }


  /**
   * Count Type PrereleaseKitCountOutputType
   */

  export type PrereleaseKitCountOutputType = {
    placedCards: number
  }

  export type PrereleaseKitCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    placedCards?: boolean | PrereleaseKitCountOutputTypeCountPlacedCardsArgs
  }

  // Custom InputTypes
  /**
   * PrereleaseKitCountOutputType without action
   */
  export type PrereleaseKitCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKitCountOutputType
     */
    select?: PrereleaseKitCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PrereleaseKitCountOutputType without action
   */
  export type PrereleaseKitCountOutputTypeCountPlacedCardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlacedCardWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Card
   */

  export type AggregateCard = {
    _count: CardCountAggregateOutputType | null
    _avg: CardAvgAggregateOutputType | null
    _sum: CardSumAggregateOutputType | null
    _min: CardMinAggregateOutputType | null
    _max: CardMaxAggregateOutputType | null
  }

  export type CardAvgAggregateOutputType = {
    cmc: number | null
  }

  export type CardSumAggregateOutputType = {
    cmc: number | null
  }

  export type CardMinAggregateOutputType = {
    id: string | null
    name: string | null
    scryfallId: string | null
    rarity: $Enums.Rarity | null
    set: string | null
    cmc: number | null
    typeLine: string | null
    imagePath: string | null
    collectorNumber: string | null
  }

  export type CardMaxAggregateOutputType = {
    id: string | null
    name: string | null
    scryfallId: string | null
    rarity: $Enums.Rarity | null
    set: string | null
    cmc: number | null
    typeLine: string | null
    imagePath: string | null
    collectorNumber: string | null
  }

  export type CardCountAggregateOutputType = {
    id: number
    name: number
    scryfallId: number
    rarity: number
    set: number
    colors: number
    cmc: number
    typeLine: number
    imagePath: number
    collectorNumber: number
    _all: number
  }


  export type CardAvgAggregateInputType = {
    cmc?: true
  }

  export type CardSumAggregateInputType = {
    cmc?: true
  }

  export type CardMinAggregateInputType = {
    id?: true
    name?: true
    scryfallId?: true
    rarity?: true
    set?: true
    cmc?: true
    typeLine?: true
    imagePath?: true
    collectorNumber?: true
  }

  export type CardMaxAggregateInputType = {
    id?: true
    name?: true
    scryfallId?: true
    rarity?: true
    set?: true
    cmc?: true
    typeLine?: true
    imagePath?: true
    collectorNumber?: true
  }

  export type CardCountAggregateInputType = {
    id?: true
    name?: true
    scryfallId?: true
    rarity?: true
    set?: true
    colors?: true
    cmc?: true
    typeLine?: true
    imagePath?: true
    collectorNumber?: true
    _all?: true
  }

  export type CardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Card to aggregate.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cards
    **/
    _count?: true | CardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CardMaxAggregateInputType
  }

  export type GetCardAggregateType<T extends CardAggregateArgs> = {
        [P in keyof T & keyof AggregateCard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCard[P]>
      : GetScalarType<T[P], AggregateCard[P]>
  }




  export type CardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CardWhereInput
    orderBy?: CardOrderByWithAggregationInput | CardOrderByWithAggregationInput[]
    by: CardScalarFieldEnum[] | CardScalarFieldEnum
    having?: CardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CardCountAggregateInputType | true
    _avg?: CardAvgAggregateInputType
    _sum?: CardSumAggregateInputType
    _min?: CardMinAggregateInputType
    _max?: CardMaxAggregateInputType
  }

  export type CardGroupByOutputType = {
    id: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    _count: CardCountAggregateOutputType | null
    _avg: CardAvgAggregateOutputType | null
    _sum: CardSumAggregateOutputType | null
    _min: CardMinAggregateOutputType | null
    _max: CardMaxAggregateOutputType | null
  }

  type GetCardGroupByPayload<T extends CardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CardGroupByOutputType[P]>
            : GetScalarType<T[P], CardGroupByOutputType[P]>
        }
      >
    >


  export type CardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    scryfallId?: boolean
    rarity?: boolean
    set?: boolean
    colors?: boolean
    cmc?: boolean
    typeLine?: boolean
    imagePath?: boolean
    collectorNumber?: boolean
    placedCards?: boolean | Card$placedCardsArgs<ExtArgs>
    promoInKits?: boolean | Card$promoInKitsArgs<ExtArgs>
    _count?: boolean | CardCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["card"]>

  export type CardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    scryfallId?: boolean
    rarity?: boolean
    set?: boolean
    colors?: boolean
    cmc?: boolean
    typeLine?: boolean
    imagePath?: boolean
    collectorNumber?: boolean
  }, ExtArgs["result"]["card"]>

  export type CardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    scryfallId?: boolean
    rarity?: boolean
    set?: boolean
    colors?: boolean
    cmc?: boolean
    typeLine?: boolean
    imagePath?: boolean
    collectorNumber?: boolean
  }, ExtArgs["result"]["card"]>

  export type CardSelectScalar = {
    id?: boolean
    name?: boolean
    scryfallId?: boolean
    rarity?: boolean
    set?: boolean
    colors?: boolean
    cmc?: boolean
    typeLine?: boolean
    imagePath?: boolean
    collectorNumber?: boolean
  }

  export type CardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "scryfallId" | "rarity" | "set" | "colors" | "cmc" | "typeLine" | "imagePath" | "collectorNumber", ExtArgs["result"]["card"]>
  export type CardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    placedCards?: boolean | Card$placedCardsArgs<ExtArgs>
    promoInKits?: boolean | Card$promoInKitsArgs<ExtArgs>
    _count?: boolean | CardCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Card"
    objects: {
      placedCards: Prisma.$PlacedCardPayload<ExtArgs>[]
      promoInKits: Prisma.$PrereleaseKitPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      scryfallId: string
      rarity: $Enums.Rarity
      set: string
      colors: Prisma.JsonValue
      cmc: number
      typeLine: string
      imagePath: string
      collectorNumber: string
    }, ExtArgs["result"]["card"]>
    composites: {}
  }

  type CardGetPayload<S extends boolean | null | undefined | CardDefaultArgs> = $Result.GetResult<Prisma.$CardPayload, S>

  type CardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CardCountAggregateInputType | true
    }

  export interface CardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Card'], meta: { name: 'Card' } }
    /**
     * Find zero or one Card that matches the filter.
     * @param {CardFindUniqueArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CardFindUniqueArgs>(args: SelectSubset<T, CardFindUniqueArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Card that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CardFindUniqueOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CardFindUniqueOrThrowArgs>(args: SelectSubset<T, CardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Card that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CardFindFirstArgs>(args?: SelectSubset<T, CardFindFirstArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Card that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindFirstOrThrowArgs} args - Arguments to find a Card
     * @example
     * // Get one Card
     * const card = await prisma.card.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CardFindFirstOrThrowArgs>(args?: SelectSubset<T, CardFindFirstOrThrowArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cards
     * const cards = await prisma.card.findMany()
     * 
     * // Get first 10 Cards
     * const cards = await prisma.card.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cardWithIdOnly = await prisma.card.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CardFindManyArgs>(args?: SelectSubset<T, CardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Card.
     * @param {CardCreateArgs} args - Arguments to create a Card.
     * @example
     * // Create one Card
     * const Card = await prisma.card.create({
     *   data: {
     *     // ... data to create a Card
     *   }
     * })
     * 
     */
    create<T extends CardCreateArgs>(args: SelectSubset<T, CardCreateArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cards.
     * @param {CardCreateManyArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CardCreateManyArgs>(args?: SelectSubset<T, CardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cards and returns the data saved in the database.
     * @param {CardCreateManyAndReturnArgs} args - Arguments to create many Cards.
     * @example
     * // Create many Cards
     * const card = await prisma.card.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CardCreateManyAndReturnArgs>(args?: SelectSubset<T, CardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Card.
     * @param {CardDeleteArgs} args - Arguments to delete one Card.
     * @example
     * // Delete one Card
     * const Card = await prisma.card.delete({
     *   where: {
     *     // ... filter to delete one Card
     *   }
     * })
     * 
     */
    delete<T extends CardDeleteArgs>(args: SelectSubset<T, CardDeleteArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Card.
     * @param {CardUpdateArgs} args - Arguments to update one Card.
     * @example
     * // Update one Card
     * const card = await prisma.card.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CardUpdateArgs>(args: SelectSubset<T, CardUpdateArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cards.
     * @param {CardDeleteManyArgs} args - Arguments to filter Cards to delete.
     * @example
     * // Delete a few Cards
     * const { count } = await prisma.card.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CardDeleteManyArgs>(args?: SelectSubset<T, CardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CardUpdateManyArgs>(args: SelectSubset<T, CardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cards and returns the data updated in the database.
     * @param {CardUpdateManyAndReturnArgs} args - Arguments to update many Cards.
     * @example
     * // Update many Cards
     * const card = await prisma.card.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cards and only return the `id`
     * const cardWithIdOnly = await prisma.card.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CardUpdateManyAndReturnArgs>(args: SelectSubset<T, CardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Card.
     * @param {CardUpsertArgs} args - Arguments to update or create a Card.
     * @example
     * // Update or create a Card
     * const card = await prisma.card.upsert({
     *   create: {
     *     // ... data to create a Card
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Card we want to update
     *   }
     * })
     */
    upsert<T extends CardUpsertArgs>(args: SelectSubset<T, CardUpsertArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardCountArgs} args - Arguments to filter Cards to count.
     * @example
     * // Count the number of Cards
     * const count = await prisma.card.count({
     *   where: {
     *     // ... the filter for the Cards we want to count
     *   }
     * })
    **/
    count<T extends CardCountArgs>(
      args?: Subset<T, CardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CardAggregateArgs>(args: Subset<T, CardAggregateArgs>): Prisma.PrismaPromise<GetCardAggregateType<T>>

    /**
     * Group by Card.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CardGroupByArgs['orderBy'] }
        : { orderBy?: CardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Card model
   */
  readonly fields: CardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Card.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    placedCards<T extends Card$placedCardsArgs<ExtArgs> = {}>(args?: Subset<T, Card$placedCardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    promoInKits<T extends Card$promoInKitsArgs<ExtArgs> = {}>(args?: Subset<T, Card$promoInKitsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Card model
   */
  interface CardFieldRefs {
    readonly id: FieldRef<"Card", 'String'>
    readonly name: FieldRef<"Card", 'String'>
    readonly scryfallId: FieldRef<"Card", 'String'>
    readonly rarity: FieldRef<"Card", 'Rarity'>
    readonly set: FieldRef<"Card", 'String'>
    readonly colors: FieldRef<"Card", 'Json'>
    readonly cmc: FieldRef<"Card", 'Int'>
    readonly typeLine: FieldRef<"Card", 'String'>
    readonly imagePath: FieldRef<"Card", 'String'>
    readonly collectorNumber: FieldRef<"Card", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Card findUnique
   */
  export type CardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card findUniqueOrThrow
   */
  export type CardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card findFirst
   */
  export type CardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card findFirstOrThrow
   */
  export type CardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Card to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card findMany
   */
  export type CardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter, which Cards to fetch.
     */
    where?: CardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cards to fetch.
     */
    orderBy?: CardOrderByWithRelationInput | CardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cards.
     */
    cursor?: CardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cards.
     */
    distinct?: CardScalarFieldEnum | CardScalarFieldEnum[]
  }

  /**
   * Card create
   */
  export type CardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The data needed to create a Card.
     */
    data: XOR<CardCreateInput, CardUncheckedCreateInput>
  }

  /**
   * Card createMany
   */
  export type CardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Card createManyAndReturn
   */
  export type CardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * The data used to create many Cards.
     */
    data: CardCreateManyInput | CardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Card update
   */
  export type CardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The data needed to update a Card.
     */
    data: XOR<CardUpdateInput, CardUncheckedUpdateInput>
    /**
     * Choose, which Card to update.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card updateMany
   */
  export type CardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to update.
     */
    limit?: number
  }

  /**
   * Card updateManyAndReturn
   */
  export type CardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * The data used to update Cards.
     */
    data: XOR<CardUpdateManyMutationInput, CardUncheckedUpdateManyInput>
    /**
     * Filter which Cards to update
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to update.
     */
    limit?: number
  }

  /**
   * Card upsert
   */
  export type CardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * The filter to search for the Card to update in case it exists.
     */
    where: CardWhereUniqueInput
    /**
     * In case the Card found by the `where` argument doesn't exist, create a new Card with this data.
     */
    create: XOR<CardCreateInput, CardUncheckedCreateInput>
    /**
     * In case the Card was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CardUpdateInput, CardUncheckedUpdateInput>
  }

  /**
   * Card delete
   */
  export type CardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    /**
     * Filter which Card to delete.
     */
    where: CardWhereUniqueInput
  }

  /**
   * Card deleteMany
   */
  export type CardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cards to delete
     */
    where?: CardWhereInput
    /**
     * Limit how many Cards to delete.
     */
    limit?: number
  }

  /**
   * Card.placedCards
   */
  export type Card$placedCardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    where?: PlacedCardWhereInput
    orderBy?: PlacedCardOrderByWithRelationInput | PlacedCardOrderByWithRelationInput[]
    cursor?: PlacedCardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlacedCardScalarFieldEnum | PlacedCardScalarFieldEnum[]
  }

  /**
   * Card.promoInKits
   */
  export type Card$promoInKitsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    where?: PrereleaseKitWhereInput
    orderBy?: PrereleaseKitOrderByWithRelationInput | PrereleaseKitOrderByWithRelationInput[]
    cursor?: PrereleaseKitWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PrereleaseKitScalarFieldEnum | PrereleaseKitScalarFieldEnum[]
  }

  /**
   * Card without action
   */
  export type CardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
  }


  /**
   * Model PrereleaseKit
   */

  export type AggregatePrereleaseKit = {
    _count: PrereleaseKitCountAggregateOutputType | null
    _min: PrereleaseKitMinAggregateOutputType | null
    _max: PrereleaseKitMaxAggregateOutputType | null
  }

  export type PrereleaseKitMinAggregateOutputType = {
    id: string | null
    college: $Enums.College | null
    createdAt: Date | null
    promoCardId: string | null
  }

  export type PrereleaseKitMaxAggregateOutputType = {
    id: string | null
    college: $Enums.College | null
    createdAt: Date | null
    promoCardId: string | null
  }

  export type PrereleaseKitCountAggregateOutputType = {
    id: number
    college: number
    createdAt: number
    promoCardId: number
    _all: number
  }


  export type PrereleaseKitMinAggregateInputType = {
    id?: true
    college?: true
    createdAt?: true
    promoCardId?: true
  }

  export type PrereleaseKitMaxAggregateInputType = {
    id?: true
    college?: true
    createdAt?: true
    promoCardId?: true
  }

  export type PrereleaseKitCountAggregateInputType = {
    id?: true
    college?: true
    createdAt?: true
    promoCardId?: true
    _all?: true
  }

  export type PrereleaseKitAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PrereleaseKit to aggregate.
     */
    where?: PrereleaseKitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrereleaseKits to fetch.
     */
    orderBy?: PrereleaseKitOrderByWithRelationInput | PrereleaseKitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PrereleaseKitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrereleaseKits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrereleaseKits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PrereleaseKits
    **/
    _count?: true | PrereleaseKitCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PrereleaseKitMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PrereleaseKitMaxAggregateInputType
  }

  export type GetPrereleaseKitAggregateType<T extends PrereleaseKitAggregateArgs> = {
        [P in keyof T & keyof AggregatePrereleaseKit]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePrereleaseKit[P]>
      : GetScalarType<T[P], AggregatePrereleaseKit[P]>
  }




  export type PrereleaseKitGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PrereleaseKitWhereInput
    orderBy?: PrereleaseKitOrderByWithAggregationInput | PrereleaseKitOrderByWithAggregationInput[]
    by: PrereleaseKitScalarFieldEnum[] | PrereleaseKitScalarFieldEnum
    having?: PrereleaseKitScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PrereleaseKitCountAggregateInputType | true
    _min?: PrereleaseKitMinAggregateInputType
    _max?: PrereleaseKitMaxAggregateInputType
  }

  export type PrereleaseKitGroupByOutputType = {
    id: string
    college: $Enums.College
    createdAt: Date
    promoCardId: string | null
    _count: PrereleaseKitCountAggregateOutputType | null
    _min: PrereleaseKitMinAggregateOutputType | null
    _max: PrereleaseKitMaxAggregateOutputType | null
  }

  type GetPrereleaseKitGroupByPayload<T extends PrereleaseKitGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PrereleaseKitGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PrereleaseKitGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PrereleaseKitGroupByOutputType[P]>
            : GetScalarType<T[P], PrereleaseKitGroupByOutputType[P]>
        }
      >
    >


  export type PrereleaseKitSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    college?: boolean
    createdAt?: boolean
    promoCardId?: boolean
    promoCard?: boolean | PrereleaseKit$promoCardArgs<ExtArgs>
    placedCards?: boolean | PrereleaseKit$placedCardsArgs<ExtArgs>
    _count?: boolean | PrereleaseKitCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["prereleaseKit"]>

  export type PrereleaseKitSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    college?: boolean
    createdAt?: boolean
    promoCardId?: boolean
    promoCard?: boolean | PrereleaseKit$promoCardArgs<ExtArgs>
  }, ExtArgs["result"]["prereleaseKit"]>

  export type PrereleaseKitSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    college?: boolean
    createdAt?: boolean
    promoCardId?: boolean
    promoCard?: boolean | PrereleaseKit$promoCardArgs<ExtArgs>
  }, ExtArgs["result"]["prereleaseKit"]>

  export type PrereleaseKitSelectScalar = {
    id?: boolean
    college?: boolean
    createdAt?: boolean
    promoCardId?: boolean
  }

  export type PrereleaseKitOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "college" | "createdAt" | "promoCardId", ExtArgs["result"]["prereleaseKit"]>
  export type PrereleaseKitInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    promoCard?: boolean | PrereleaseKit$promoCardArgs<ExtArgs>
    placedCards?: boolean | PrereleaseKit$placedCardsArgs<ExtArgs>
    _count?: boolean | PrereleaseKitCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PrereleaseKitIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    promoCard?: boolean | PrereleaseKit$promoCardArgs<ExtArgs>
  }
  export type PrereleaseKitIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    promoCard?: boolean | PrereleaseKit$promoCardArgs<ExtArgs>
  }

  export type $PrereleaseKitPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PrereleaseKit"
    objects: {
      promoCard: Prisma.$CardPayload<ExtArgs> | null
      placedCards: Prisma.$PlacedCardPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      college: $Enums.College
      createdAt: Date
      promoCardId: string | null
    }, ExtArgs["result"]["prereleaseKit"]>
    composites: {}
  }

  type PrereleaseKitGetPayload<S extends boolean | null | undefined | PrereleaseKitDefaultArgs> = $Result.GetResult<Prisma.$PrereleaseKitPayload, S>

  type PrereleaseKitCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PrereleaseKitFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PrereleaseKitCountAggregateInputType | true
    }

  export interface PrereleaseKitDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PrereleaseKit'], meta: { name: 'PrereleaseKit' } }
    /**
     * Find zero or one PrereleaseKit that matches the filter.
     * @param {PrereleaseKitFindUniqueArgs} args - Arguments to find a PrereleaseKit
     * @example
     * // Get one PrereleaseKit
     * const prereleaseKit = await prisma.prereleaseKit.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PrereleaseKitFindUniqueArgs>(args: SelectSubset<T, PrereleaseKitFindUniqueArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PrereleaseKit that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PrereleaseKitFindUniqueOrThrowArgs} args - Arguments to find a PrereleaseKit
     * @example
     * // Get one PrereleaseKit
     * const prereleaseKit = await prisma.prereleaseKit.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PrereleaseKitFindUniqueOrThrowArgs>(args: SelectSubset<T, PrereleaseKitFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PrereleaseKit that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitFindFirstArgs} args - Arguments to find a PrereleaseKit
     * @example
     * // Get one PrereleaseKit
     * const prereleaseKit = await prisma.prereleaseKit.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PrereleaseKitFindFirstArgs>(args?: SelectSubset<T, PrereleaseKitFindFirstArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PrereleaseKit that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitFindFirstOrThrowArgs} args - Arguments to find a PrereleaseKit
     * @example
     * // Get one PrereleaseKit
     * const prereleaseKit = await prisma.prereleaseKit.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PrereleaseKitFindFirstOrThrowArgs>(args?: SelectSubset<T, PrereleaseKitFindFirstOrThrowArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PrereleaseKits that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PrereleaseKits
     * const prereleaseKits = await prisma.prereleaseKit.findMany()
     * 
     * // Get first 10 PrereleaseKits
     * const prereleaseKits = await prisma.prereleaseKit.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const prereleaseKitWithIdOnly = await prisma.prereleaseKit.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PrereleaseKitFindManyArgs>(args?: SelectSubset<T, PrereleaseKitFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PrereleaseKit.
     * @param {PrereleaseKitCreateArgs} args - Arguments to create a PrereleaseKit.
     * @example
     * // Create one PrereleaseKit
     * const PrereleaseKit = await prisma.prereleaseKit.create({
     *   data: {
     *     // ... data to create a PrereleaseKit
     *   }
     * })
     * 
     */
    create<T extends PrereleaseKitCreateArgs>(args: SelectSubset<T, PrereleaseKitCreateArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PrereleaseKits.
     * @param {PrereleaseKitCreateManyArgs} args - Arguments to create many PrereleaseKits.
     * @example
     * // Create many PrereleaseKits
     * const prereleaseKit = await prisma.prereleaseKit.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PrereleaseKitCreateManyArgs>(args?: SelectSubset<T, PrereleaseKitCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PrereleaseKits and returns the data saved in the database.
     * @param {PrereleaseKitCreateManyAndReturnArgs} args - Arguments to create many PrereleaseKits.
     * @example
     * // Create many PrereleaseKits
     * const prereleaseKit = await prisma.prereleaseKit.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PrereleaseKits and only return the `id`
     * const prereleaseKitWithIdOnly = await prisma.prereleaseKit.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PrereleaseKitCreateManyAndReturnArgs>(args?: SelectSubset<T, PrereleaseKitCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PrereleaseKit.
     * @param {PrereleaseKitDeleteArgs} args - Arguments to delete one PrereleaseKit.
     * @example
     * // Delete one PrereleaseKit
     * const PrereleaseKit = await prisma.prereleaseKit.delete({
     *   where: {
     *     // ... filter to delete one PrereleaseKit
     *   }
     * })
     * 
     */
    delete<T extends PrereleaseKitDeleteArgs>(args: SelectSubset<T, PrereleaseKitDeleteArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PrereleaseKit.
     * @param {PrereleaseKitUpdateArgs} args - Arguments to update one PrereleaseKit.
     * @example
     * // Update one PrereleaseKit
     * const prereleaseKit = await prisma.prereleaseKit.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PrereleaseKitUpdateArgs>(args: SelectSubset<T, PrereleaseKitUpdateArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PrereleaseKits.
     * @param {PrereleaseKitDeleteManyArgs} args - Arguments to filter PrereleaseKits to delete.
     * @example
     * // Delete a few PrereleaseKits
     * const { count } = await prisma.prereleaseKit.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PrereleaseKitDeleteManyArgs>(args?: SelectSubset<T, PrereleaseKitDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PrereleaseKits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PrereleaseKits
     * const prereleaseKit = await prisma.prereleaseKit.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PrereleaseKitUpdateManyArgs>(args: SelectSubset<T, PrereleaseKitUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PrereleaseKits and returns the data updated in the database.
     * @param {PrereleaseKitUpdateManyAndReturnArgs} args - Arguments to update many PrereleaseKits.
     * @example
     * // Update many PrereleaseKits
     * const prereleaseKit = await prisma.prereleaseKit.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PrereleaseKits and only return the `id`
     * const prereleaseKitWithIdOnly = await prisma.prereleaseKit.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PrereleaseKitUpdateManyAndReturnArgs>(args: SelectSubset<T, PrereleaseKitUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PrereleaseKit.
     * @param {PrereleaseKitUpsertArgs} args - Arguments to update or create a PrereleaseKit.
     * @example
     * // Update or create a PrereleaseKit
     * const prereleaseKit = await prisma.prereleaseKit.upsert({
     *   create: {
     *     // ... data to create a PrereleaseKit
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PrereleaseKit we want to update
     *   }
     * })
     */
    upsert<T extends PrereleaseKitUpsertArgs>(args: SelectSubset<T, PrereleaseKitUpsertArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PrereleaseKits.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitCountArgs} args - Arguments to filter PrereleaseKits to count.
     * @example
     * // Count the number of PrereleaseKits
     * const count = await prisma.prereleaseKit.count({
     *   where: {
     *     // ... the filter for the PrereleaseKits we want to count
     *   }
     * })
    **/
    count<T extends PrereleaseKitCountArgs>(
      args?: Subset<T, PrereleaseKitCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PrereleaseKitCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PrereleaseKit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PrereleaseKitAggregateArgs>(args: Subset<T, PrereleaseKitAggregateArgs>): Prisma.PrismaPromise<GetPrereleaseKitAggregateType<T>>

    /**
     * Group by PrereleaseKit.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PrereleaseKitGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PrereleaseKitGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PrereleaseKitGroupByArgs['orderBy'] }
        : { orderBy?: PrereleaseKitGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PrereleaseKitGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPrereleaseKitGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PrereleaseKit model
   */
  readonly fields: PrereleaseKitFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PrereleaseKit.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PrereleaseKitClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    promoCard<T extends PrereleaseKit$promoCardArgs<ExtArgs> = {}>(args?: Subset<T, PrereleaseKit$promoCardArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    placedCards<T extends PrereleaseKit$placedCardsArgs<ExtArgs> = {}>(args?: Subset<T, PrereleaseKit$placedCardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PrereleaseKit model
   */
  interface PrereleaseKitFieldRefs {
    readonly id: FieldRef<"PrereleaseKit", 'String'>
    readonly college: FieldRef<"PrereleaseKit", 'College'>
    readonly createdAt: FieldRef<"PrereleaseKit", 'DateTime'>
    readonly promoCardId: FieldRef<"PrereleaseKit", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PrereleaseKit findUnique
   */
  export type PrereleaseKitFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * Filter, which PrereleaseKit to fetch.
     */
    where: PrereleaseKitWhereUniqueInput
  }

  /**
   * PrereleaseKit findUniqueOrThrow
   */
  export type PrereleaseKitFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * Filter, which PrereleaseKit to fetch.
     */
    where: PrereleaseKitWhereUniqueInput
  }

  /**
   * PrereleaseKit findFirst
   */
  export type PrereleaseKitFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * Filter, which PrereleaseKit to fetch.
     */
    where?: PrereleaseKitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrereleaseKits to fetch.
     */
    orderBy?: PrereleaseKitOrderByWithRelationInput | PrereleaseKitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PrereleaseKits.
     */
    cursor?: PrereleaseKitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrereleaseKits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrereleaseKits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PrereleaseKits.
     */
    distinct?: PrereleaseKitScalarFieldEnum | PrereleaseKitScalarFieldEnum[]
  }

  /**
   * PrereleaseKit findFirstOrThrow
   */
  export type PrereleaseKitFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * Filter, which PrereleaseKit to fetch.
     */
    where?: PrereleaseKitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrereleaseKits to fetch.
     */
    orderBy?: PrereleaseKitOrderByWithRelationInput | PrereleaseKitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PrereleaseKits.
     */
    cursor?: PrereleaseKitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrereleaseKits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrereleaseKits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PrereleaseKits.
     */
    distinct?: PrereleaseKitScalarFieldEnum | PrereleaseKitScalarFieldEnum[]
  }

  /**
   * PrereleaseKit findMany
   */
  export type PrereleaseKitFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * Filter, which PrereleaseKits to fetch.
     */
    where?: PrereleaseKitWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PrereleaseKits to fetch.
     */
    orderBy?: PrereleaseKitOrderByWithRelationInput | PrereleaseKitOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PrereleaseKits.
     */
    cursor?: PrereleaseKitWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PrereleaseKits from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PrereleaseKits.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PrereleaseKits.
     */
    distinct?: PrereleaseKitScalarFieldEnum | PrereleaseKitScalarFieldEnum[]
  }

  /**
   * PrereleaseKit create
   */
  export type PrereleaseKitCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * The data needed to create a PrereleaseKit.
     */
    data: XOR<PrereleaseKitCreateInput, PrereleaseKitUncheckedCreateInput>
  }

  /**
   * PrereleaseKit createMany
   */
  export type PrereleaseKitCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PrereleaseKits.
     */
    data: PrereleaseKitCreateManyInput | PrereleaseKitCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PrereleaseKit createManyAndReturn
   */
  export type PrereleaseKitCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * The data used to create many PrereleaseKits.
     */
    data: PrereleaseKitCreateManyInput | PrereleaseKitCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PrereleaseKit update
   */
  export type PrereleaseKitUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * The data needed to update a PrereleaseKit.
     */
    data: XOR<PrereleaseKitUpdateInput, PrereleaseKitUncheckedUpdateInput>
    /**
     * Choose, which PrereleaseKit to update.
     */
    where: PrereleaseKitWhereUniqueInput
  }

  /**
   * PrereleaseKit updateMany
   */
  export type PrereleaseKitUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PrereleaseKits.
     */
    data: XOR<PrereleaseKitUpdateManyMutationInput, PrereleaseKitUncheckedUpdateManyInput>
    /**
     * Filter which PrereleaseKits to update
     */
    where?: PrereleaseKitWhereInput
    /**
     * Limit how many PrereleaseKits to update.
     */
    limit?: number
  }

  /**
   * PrereleaseKit updateManyAndReturn
   */
  export type PrereleaseKitUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * The data used to update PrereleaseKits.
     */
    data: XOR<PrereleaseKitUpdateManyMutationInput, PrereleaseKitUncheckedUpdateManyInput>
    /**
     * Filter which PrereleaseKits to update
     */
    where?: PrereleaseKitWhereInput
    /**
     * Limit how many PrereleaseKits to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PrereleaseKit upsert
   */
  export type PrereleaseKitUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * The filter to search for the PrereleaseKit to update in case it exists.
     */
    where: PrereleaseKitWhereUniqueInput
    /**
     * In case the PrereleaseKit found by the `where` argument doesn't exist, create a new PrereleaseKit with this data.
     */
    create: XOR<PrereleaseKitCreateInput, PrereleaseKitUncheckedCreateInput>
    /**
     * In case the PrereleaseKit was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PrereleaseKitUpdateInput, PrereleaseKitUncheckedUpdateInput>
  }

  /**
   * PrereleaseKit delete
   */
  export type PrereleaseKitDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
    /**
     * Filter which PrereleaseKit to delete.
     */
    where: PrereleaseKitWhereUniqueInput
  }

  /**
   * PrereleaseKit deleteMany
   */
  export type PrereleaseKitDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PrereleaseKits to delete
     */
    where?: PrereleaseKitWhereInput
    /**
     * Limit how many PrereleaseKits to delete.
     */
    limit?: number
  }

  /**
   * PrereleaseKit.promoCard
   */
  export type PrereleaseKit$promoCardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Card
     */
    select?: CardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Card
     */
    omit?: CardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CardInclude<ExtArgs> | null
    where?: CardWhereInput
  }

  /**
   * PrereleaseKit.placedCards
   */
  export type PrereleaseKit$placedCardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    where?: PlacedCardWhereInput
    orderBy?: PlacedCardOrderByWithRelationInput | PlacedCardOrderByWithRelationInput[]
    cursor?: PlacedCardWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlacedCardScalarFieldEnum | PlacedCardScalarFieldEnum[]
  }

  /**
   * PrereleaseKit without action
   */
  export type PrereleaseKitDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PrereleaseKit
     */
    select?: PrereleaseKitSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PrereleaseKit
     */
    omit?: PrereleaseKitOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PrereleaseKitInclude<ExtArgs> | null
  }


  /**
   * Model PlacedCard
   */

  export type AggregatePlacedCard = {
    _count: PlacedCardCountAggregateOutputType | null
    _avg: PlacedCardAvgAggregateOutputType | null
    _sum: PlacedCardSumAggregateOutputType | null
    _min: PlacedCardMinAggregateOutputType | null
    _max: PlacedCardMaxAggregateOutputType | null
  }

  export type PlacedCardAvgAggregateOutputType = {
    posX: number | null
    posY: number | null
    zIndex: number | null
  }

  export type PlacedCardSumAggregateOutputType = {
    posX: number | null
    posY: number | null
    zIndex: number | null
  }

  export type PlacedCardMinAggregateOutputType = {
    id: string | null
    cardId: string | null
    kitId: string | null
    posX: number | null
    posY: number | null
    zIndex: number | null
    isMainDeck: boolean | null
    isFoil: boolean | null
  }

  export type PlacedCardMaxAggregateOutputType = {
    id: string | null
    cardId: string | null
    kitId: string | null
    posX: number | null
    posY: number | null
    zIndex: number | null
    isMainDeck: boolean | null
    isFoil: boolean | null
  }

  export type PlacedCardCountAggregateOutputType = {
    id: number
    cardId: number
    kitId: number
    posX: number
    posY: number
    zIndex: number
    isMainDeck: number
    isFoil: number
    _all: number
  }


  export type PlacedCardAvgAggregateInputType = {
    posX?: true
    posY?: true
    zIndex?: true
  }

  export type PlacedCardSumAggregateInputType = {
    posX?: true
    posY?: true
    zIndex?: true
  }

  export type PlacedCardMinAggregateInputType = {
    id?: true
    cardId?: true
    kitId?: true
    posX?: true
    posY?: true
    zIndex?: true
    isMainDeck?: true
    isFoil?: true
  }

  export type PlacedCardMaxAggregateInputType = {
    id?: true
    cardId?: true
    kitId?: true
    posX?: true
    posY?: true
    zIndex?: true
    isMainDeck?: true
    isFoil?: true
  }

  export type PlacedCardCountAggregateInputType = {
    id?: true
    cardId?: true
    kitId?: true
    posX?: true
    posY?: true
    zIndex?: true
    isMainDeck?: true
    isFoil?: true
    _all?: true
  }

  export type PlacedCardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlacedCard to aggregate.
     */
    where?: PlacedCardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacedCards to fetch.
     */
    orderBy?: PlacedCardOrderByWithRelationInput | PlacedCardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlacedCardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacedCards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacedCards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlacedCards
    **/
    _count?: true | PlacedCardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlacedCardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlacedCardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlacedCardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlacedCardMaxAggregateInputType
  }

  export type GetPlacedCardAggregateType<T extends PlacedCardAggregateArgs> = {
        [P in keyof T & keyof AggregatePlacedCard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlacedCard[P]>
      : GetScalarType<T[P], AggregatePlacedCard[P]>
  }




  export type PlacedCardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlacedCardWhereInput
    orderBy?: PlacedCardOrderByWithAggregationInput | PlacedCardOrderByWithAggregationInput[]
    by: PlacedCardScalarFieldEnum[] | PlacedCardScalarFieldEnum
    having?: PlacedCardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlacedCardCountAggregateInputType | true
    _avg?: PlacedCardAvgAggregateInputType
    _sum?: PlacedCardSumAggregateInputType
    _min?: PlacedCardMinAggregateInputType
    _max?: PlacedCardMaxAggregateInputType
  }

  export type PlacedCardGroupByOutputType = {
    id: string
    cardId: string
    kitId: string
    posX: number
    posY: number
    zIndex: number
    isMainDeck: boolean
    isFoil: boolean
    _count: PlacedCardCountAggregateOutputType | null
    _avg: PlacedCardAvgAggregateOutputType | null
    _sum: PlacedCardSumAggregateOutputType | null
    _min: PlacedCardMinAggregateOutputType | null
    _max: PlacedCardMaxAggregateOutputType | null
  }

  type GetPlacedCardGroupByPayload<T extends PlacedCardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlacedCardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlacedCardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlacedCardGroupByOutputType[P]>
            : GetScalarType<T[P], PlacedCardGroupByOutputType[P]>
        }
      >
    >


  export type PlacedCardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cardId?: boolean
    kitId?: boolean
    posX?: boolean
    posY?: boolean
    zIndex?: boolean
    isMainDeck?: boolean
    isFoil?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    kit?: boolean | PrereleaseKitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["placedCard"]>

  export type PlacedCardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cardId?: boolean
    kitId?: boolean
    posX?: boolean
    posY?: boolean
    zIndex?: boolean
    isMainDeck?: boolean
    isFoil?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    kit?: boolean | PrereleaseKitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["placedCard"]>

  export type PlacedCardSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cardId?: boolean
    kitId?: boolean
    posX?: boolean
    posY?: boolean
    zIndex?: boolean
    isMainDeck?: boolean
    isFoil?: boolean
    card?: boolean | CardDefaultArgs<ExtArgs>
    kit?: boolean | PrereleaseKitDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["placedCard"]>

  export type PlacedCardSelectScalar = {
    id?: boolean
    cardId?: boolean
    kitId?: boolean
    posX?: boolean
    posY?: boolean
    zIndex?: boolean
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PlacedCardOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cardId" | "kitId" | "posX" | "posY" | "zIndex" | "isMainDeck" | "isFoil", ExtArgs["result"]["placedCard"]>
  export type PlacedCardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    kit?: boolean | PrereleaseKitDefaultArgs<ExtArgs>
  }
  export type PlacedCardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    kit?: boolean | PrereleaseKitDefaultArgs<ExtArgs>
  }
  export type PlacedCardIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    card?: boolean | CardDefaultArgs<ExtArgs>
    kit?: boolean | PrereleaseKitDefaultArgs<ExtArgs>
  }

  export type $PlacedCardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlacedCard"
    objects: {
      card: Prisma.$CardPayload<ExtArgs>
      kit: Prisma.$PrereleaseKitPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cardId: string
      kitId: string
      posX: number
      posY: number
      zIndex: number
      isMainDeck: boolean
      isFoil: boolean
    }, ExtArgs["result"]["placedCard"]>
    composites: {}
  }

  type PlacedCardGetPayload<S extends boolean | null | undefined | PlacedCardDefaultArgs> = $Result.GetResult<Prisma.$PlacedCardPayload, S>

  type PlacedCardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PlacedCardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PlacedCardCountAggregateInputType | true
    }

  export interface PlacedCardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlacedCard'], meta: { name: 'PlacedCard' } }
    /**
     * Find zero or one PlacedCard that matches the filter.
     * @param {PlacedCardFindUniqueArgs} args - Arguments to find a PlacedCard
     * @example
     * // Get one PlacedCard
     * const placedCard = await prisma.placedCard.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlacedCardFindUniqueArgs>(args: SelectSubset<T, PlacedCardFindUniqueArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PlacedCard that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlacedCardFindUniqueOrThrowArgs} args - Arguments to find a PlacedCard
     * @example
     * // Get one PlacedCard
     * const placedCard = await prisma.placedCard.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlacedCardFindUniqueOrThrowArgs>(args: SelectSubset<T, PlacedCardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlacedCard that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardFindFirstArgs} args - Arguments to find a PlacedCard
     * @example
     * // Get one PlacedCard
     * const placedCard = await prisma.placedCard.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlacedCardFindFirstArgs>(args?: SelectSubset<T, PlacedCardFindFirstArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PlacedCard that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardFindFirstOrThrowArgs} args - Arguments to find a PlacedCard
     * @example
     * // Get one PlacedCard
     * const placedCard = await prisma.placedCard.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlacedCardFindFirstOrThrowArgs>(args?: SelectSubset<T, PlacedCardFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PlacedCards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlacedCards
     * const placedCards = await prisma.placedCard.findMany()
     * 
     * // Get first 10 PlacedCards
     * const placedCards = await prisma.placedCard.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const placedCardWithIdOnly = await prisma.placedCard.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlacedCardFindManyArgs>(args?: SelectSubset<T, PlacedCardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PlacedCard.
     * @param {PlacedCardCreateArgs} args - Arguments to create a PlacedCard.
     * @example
     * // Create one PlacedCard
     * const PlacedCard = await prisma.placedCard.create({
     *   data: {
     *     // ... data to create a PlacedCard
     *   }
     * })
     * 
     */
    create<T extends PlacedCardCreateArgs>(args: SelectSubset<T, PlacedCardCreateArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PlacedCards.
     * @param {PlacedCardCreateManyArgs} args - Arguments to create many PlacedCards.
     * @example
     * // Create many PlacedCards
     * const placedCard = await prisma.placedCard.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlacedCardCreateManyArgs>(args?: SelectSubset<T, PlacedCardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlacedCards and returns the data saved in the database.
     * @param {PlacedCardCreateManyAndReturnArgs} args - Arguments to create many PlacedCards.
     * @example
     * // Create many PlacedCards
     * const placedCard = await prisma.placedCard.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlacedCards and only return the `id`
     * const placedCardWithIdOnly = await prisma.placedCard.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlacedCardCreateManyAndReturnArgs>(args?: SelectSubset<T, PlacedCardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PlacedCard.
     * @param {PlacedCardDeleteArgs} args - Arguments to delete one PlacedCard.
     * @example
     * // Delete one PlacedCard
     * const PlacedCard = await prisma.placedCard.delete({
     *   where: {
     *     // ... filter to delete one PlacedCard
     *   }
     * })
     * 
     */
    delete<T extends PlacedCardDeleteArgs>(args: SelectSubset<T, PlacedCardDeleteArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PlacedCard.
     * @param {PlacedCardUpdateArgs} args - Arguments to update one PlacedCard.
     * @example
     * // Update one PlacedCard
     * const placedCard = await prisma.placedCard.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlacedCardUpdateArgs>(args: SelectSubset<T, PlacedCardUpdateArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PlacedCards.
     * @param {PlacedCardDeleteManyArgs} args - Arguments to filter PlacedCards to delete.
     * @example
     * // Delete a few PlacedCards
     * const { count } = await prisma.placedCard.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlacedCardDeleteManyArgs>(args?: SelectSubset<T, PlacedCardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlacedCards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlacedCards
     * const placedCard = await prisma.placedCard.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlacedCardUpdateManyArgs>(args: SelectSubset<T, PlacedCardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlacedCards and returns the data updated in the database.
     * @param {PlacedCardUpdateManyAndReturnArgs} args - Arguments to update many PlacedCards.
     * @example
     * // Update many PlacedCards
     * const placedCard = await prisma.placedCard.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PlacedCards and only return the `id`
     * const placedCardWithIdOnly = await prisma.placedCard.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PlacedCardUpdateManyAndReturnArgs>(args: SelectSubset<T, PlacedCardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PlacedCard.
     * @param {PlacedCardUpsertArgs} args - Arguments to update or create a PlacedCard.
     * @example
     * // Update or create a PlacedCard
     * const placedCard = await prisma.placedCard.upsert({
     *   create: {
     *     // ... data to create a PlacedCard
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlacedCard we want to update
     *   }
     * })
     */
    upsert<T extends PlacedCardUpsertArgs>(args: SelectSubset<T, PlacedCardUpsertArgs<ExtArgs>>): Prisma__PlacedCardClient<$Result.GetResult<Prisma.$PlacedCardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PlacedCards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardCountArgs} args - Arguments to filter PlacedCards to count.
     * @example
     * // Count the number of PlacedCards
     * const count = await prisma.placedCard.count({
     *   where: {
     *     // ... the filter for the PlacedCards we want to count
     *   }
     * })
    **/
    count<T extends PlacedCardCountArgs>(
      args?: Subset<T, PlacedCardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlacedCardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlacedCard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlacedCardAggregateArgs>(args: Subset<T, PlacedCardAggregateArgs>): Prisma.PrismaPromise<GetPlacedCardAggregateType<T>>

    /**
     * Group by PlacedCard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacedCardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlacedCardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlacedCardGroupByArgs['orderBy'] }
        : { orderBy?: PlacedCardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlacedCardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlacedCardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlacedCard model
   */
  readonly fields: PlacedCardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlacedCard.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlacedCardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    card<T extends CardDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CardDefaultArgs<ExtArgs>>): Prisma__CardClient<$Result.GetResult<Prisma.$CardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    kit<T extends PrereleaseKitDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PrereleaseKitDefaultArgs<ExtArgs>>): Prisma__PrereleaseKitClient<$Result.GetResult<Prisma.$PrereleaseKitPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlacedCard model
   */
  interface PlacedCardFieldRefs {
    readonly id: FieldRef<"PlacedCard", 'String'>
    readonly cardId: FieldRef<"PlacedCard", 'String'>
    readonly kitId: FieldRef<"PlacedCard", 'String'>
    readonly posX: FieldRef<"PlacedCard", 'Float'>
    readonly posY: FieldRef<"PlacedCard", 'Float'>
    readonly zIndex: FieldRef<"PlacedCard", 'Int'>
    readonly isMainDeck: FieldRef<"PlacedCard", 'Boolean'>
    readonly isFoil: FieldRef<"PlacedCard", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * PlacedCard findUnique
   */
  export type PlacedCardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * Filter, which PlacedCard to fetch.
     */
    where: PlacedCardWhereUniqueInput
  }

  /**
   * PlacedCard findUniqueOrThrow
   */
  export type PlacedCardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * Filter, which PlacedCard to fetch.
     */
    where: PlacedCardWhereUniqueInput
  }

  /**
   * PlacedCard findFirst
   */
  export type PlacedCardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * Filter, which PlacedCard to fetch.
     */
    where?: PlacedCardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacedCards to fetch.
     */
    orderBy?: PlacedCardOrderByWithRelationInput | PlacedCardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlacedCards.
     */
    cursor?: PlacedCardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacedCards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacedCards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlacedCards.
     */
    distinct?: PlacedCardScalarFieldEnum | PlacedCardScalarFieldEnum[]
  }

  /**
   * PlacedCard findFirstOrThrow
   */
  export type PlacedCardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * Filter, which PlacedCard to fetch.
     */
    where?: PlacedCardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacedCards to fetch.
     */
    orderBy?: PlacedCardOrderByWithRelationInput | PlacedCardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlacedCards.
     */
    cursor?: PlacedCardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacedCards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacedCards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlacedCards.
     */
    distinct?: PlacedCardScalarFieldEnum | PlacedCardScalarFieldEnum[]
  }

  /**
   * PlacedCard findMany
   */
  export type PlacedCardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * Filter, which PlacedCards to fetch.
     */
    where?: PlacedCardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacedCards to fetch.
     */
    orderBy?: PlacedCardOrderByWithRelationInput | PlacedCardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlacedCards.
     */
    cursor?: PlacedCardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacedCards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacedCards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlacedCards.
     */
    distinct?: PlacedCardScalarFieldEnum | PlacedCardScalarFieldEnum[]
  }

  /**
   * PlacedCard create
   */
  export type PlacedCardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * The data needed to create a PlacedCard.
     */
    data: XOR<PlacedCardCreateInput, PlacedCardUncheckedCreateInput>
  }

  /**
   * PlacedCard createMany
   */
  export type PlacedCardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlacedCards.
     */
    data: PlacedCardCreateManyInput | PlacedCardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlacedCard createManyAndReturn
   */
  export type PlacedCardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * The data used to create many PlacedCards.
     */
    data: PlacedCardCreateManyInput | PlacedCardCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlacedCard update
   */
  export type PlacedCardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * The data needed to update a PlacedCard.
     */
    data: XOR<PlacedCardUpdateInput, PlacedCardUncheckedUpdateInput>
    /**
     * Choose, which PlacedCard to update.
     */
    where: PlacedCardWhereUniqueInput
  }

  /**
   * PlacedCard updateMany
   */
  export type PlacedCardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlacedCards.
     */
    data: XOR<PlacedCardUpdateManyMutationInput, PlacedCardUncheckedUpdateManyInput>
    /**
     * Filter which PlacedCards to update
     */
    where?: PlacedCardWhereInput
    /**
     * Limit how many PlacedCards to update.
     */
    limit?: number
  }

  /**
   * PlacedCard updateManyAndReturn
   */
  export type PlacedCardUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * The data used to update PlacedCards.
     */
    data: XOR<PlacedCardUpdateManyMutationInput, PlacedCardUncheckedUpdateManyInput>
    /**
     * Filter which PlacedCards to update
     */
    where?: PlacedCardWhereInput
    /**
     * Limit how many PlacedCards to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlacedCard upsert
   */
  export type PlacedCardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * The filter to search for the PlacedCard to update in case it exists.
     */
    where: PlacedCardWhereUniqueInput
    /**
     * In case the PlacedCard found by the `where` argument doesn't exist, create a new PlacedCard with this data.
     */
    create: XOR<PlacedCardCreateInput, PlacedCardUncheckedCreateInput>
    /**
     * In case the PlacedCard was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlacedCardUpdateInput, PlacedCardUncheckedUpdateInput>
  }

  /**
   * PlacedCard delete
   */
  export type PlacedCardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
    /**
     * Filter which PlacedCard to delete.
     */
    where: PlacedCardWhereUniqueInput
  }

  /**
   * PlacedCard deleteMany
   */
  export type PlacedCardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlacedCards to delete
     */
    where?: PlacedCardWhereInput
    /**
     * Limit how many PlacedCards to delete.
     */
    limit?: number
  }

  /**
   * PlacedCard without action
   */
  export type PlacedCardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacedCard
     */
    select?: PlacedCardSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PlacedCard
     */
    omit?: PlacedCardOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacedCardInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CardScalarFieldEnum: {
    id: 'id',
    name: 'name',
    scryfallId: 'scryfallId',
    rarity: 'rarity',
    set: 'set',
    colors: 'colors',
    cmc: 'cmc',
    typeLine: 'typeLine',
    imagePath: 'imagePath',
    collectorNumber: 'collectorNumber'
  };

  export type CardScalarFieldEnum = (typeof CardScalarFieldEnum)[keyof typeof CardScalarFieldEnum]


  export const PrereleaseKitScalarFieldEnum: {
    id: 'id',
    college: 'college',
    createdAt: 'createdAt',
    promoCardId: 'promoCardId'
  };

  export type PrereleaseKitScalarFieldEnum = (typeof PrereleaseKitScalarFieldEnum)[keyof typeof PrereleaseKitScalarFieldEnum]


  export const PlacedCardScalarFieldEnum: {
    id: 'id',
    cardId: 'cardId',
    kitId: 'kitId',
    posX: 'posX',
    posY: 'posY',
    zIndex: 'zIndex',
    isMainDeck: 'isMainDeck',
    isFoil: 'isFoil'
  };

  export type PlacedCardScalarFieldEnum = (typeof PlacedCardScalarFieldEnum)[keyof typeof PlacedCardScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Rarity'
   */
  export type EnumRarityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Rarity'>
    


  /**
   * Reference to a field of type 'Rarity[]'
   */
  export type ListEnumRarityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Rarity[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'College'
   */
  export type EnumCollegeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'College'>
    


  /**
   * Reference to a field of type 'College[]'
   */
  export type ListEnumCollegeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'College[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type CardWhereInput = {
    AND?: CardWhereInput | CardWhereInput[]
    OR?: CardWhereInput[]
    NOT?: CardWhereInput | CardWhereInput[]
    id?: StringFilter<"Card"> | string
    name?: StringFilter<"Card"> | string
    scryfallId?: StringFilter<"Card"> | string
    rarity?: EnumRarityFilter<"Card"> | $Enums.Rarity
    set?: StringFilter<"Card"> | string
    colors?: JsonFilter<"Card">
    cmc?: IntFilter<"Card"> | number
    typeLine?: StringFilter<"Card"> | string
    imagePath?: StringFilter<"Card"> | string
    collectorNumber?: StringFilter<"Card"> | string
    placedCards?: PlacedCardListRelationFilter
    promoInKits?: PrereleaseKitListRelationFilter
  }

  export type CardOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    scryfallId?: SortOrder
    rarity?: SortOrder
    set?: SortOrder
    colors?: SortOrder
    cmc?: SortOrder
    typeLine?: SortOrder
    imagePath?: SortOrder
    collectorNumber?: SortOrder
    placedCards?: PlacedCardOrderByRelationAggregateInput
    promoInKits?: PrereleaseKitOrderByRelationAggregateInput
  }

  export type CardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    scryfallId?: string
    AND?: CardWhereInput | CardWhereInput[]
    OR?: CardWhereInput[]
    NOT?: CardWhereInput | CardWhereInput[]
    name?: StringFilter<"Card"> | string
    rarity?: EnumRarityFilter<"Card"> | $Enums.Rarity
    set?: StringFilter<"Card"> | string
    colors?: JsonFilter<"Card">
    cmc?: IntFilter<"Card"> | number
    typeLine?: StringFilter<"Card"> | string
    imagePath?: StringFilter<"Card"> | string
    collectorNumber?: StringFilter<"Card"> | string
    placedCards?: PlacedCardListRelationFilter
    promoInKits?: PrereleaseKitListRelationFilter
  }, "id" | "scryfallId">

  export type CardOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    scryfallId?: SortOrder
    rarity?: SortOrder
    set?: SortOrder
    colors?: SortOrder
    cmc?: SortOrder
    typeLine?: SortOrder
    imagePath?: SortOrder
    collectorNumber?: SortOrder
    _count?: CardCountOrderByAggregateInput
    _avg?: CardAvgOrderByAggregateInput
    _max?: CardMaxOrderByAggregateInput
    _min?: CardMinOrderByAggregateInput
    _sum?: CardSumOrderByAggregateInput
  }

  export type CardScalarWhereWithAggregatesInput = {
    AND?: CardScalarWhereWithAggregatesInput | CardScalarWhereWithAggregatesInput[]
    OR?: CardScalarWhereWithAggregatesInput[]
    NOT?: CardScalarWhereWithAggregatesInput | CardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Card"> | string
    name?: StringWithAggregatesFilter<"Card"> | string
    scryfallId?: StringWithAggregatesFilter<"Card"> | string
    rarity?: EnumRarityWithAggregatesFilter<"Card"> | $Enums.Rarity
    set?: StringWithAggregatesFilter<"Card"> | string
    colors?: JsonWithAggregatesFilter<"Card">
    cmc?: IntWithAggregatesFilter<"Card"> | number
    typeLine?: StringWithAggregatesFilter<"Card"> | string
    imagePath?: StringWithAggregatesFilter<"Card"> | string
    collectorNumber?: StringWithAggregatesFilter<"Card"> | string
  }

  export type PrereleaseKitWhereInput = {
    AND?: PrereleaseKitWhereInput | PrereleaseKitWhereInput[]
    OR?: PrereleaseKitWhereInput[]
    NOT?: PrereleaseKitWhereInput | PrereleaseKitWhereInput[]
    id?: StringFilter<"PrereleaseKit"> | string
    college?: EnumCollegeFilter<"PrereleaseKit"> | $Enums.College
    createdAt?: DateTimeFilter<"PrereleaseKit"> | Date | string
    promoCardId?: StringNullableFilter<"PrereleaseKit"> | string | null
    promoCard?: XOR<CardNullableScalarRelationFilter, CardWhereInput> | null
    placedCards?: PlacedCardListRelationFilter
  }

  export type PrereleaseKitOrderByWithRelationInput = {
    id?: SortOrder
    college?: SortOrder
    createdAt?: SortOrder
    promoCardId?: SortOrderInput | SortOrder
    promoCard?: CardOrderByWithRelationInput
    placedCards?: PlacedCardOrderByRelationAggregateInput
  }

  export type PrereleaseKitWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PrereleaseKitWhereInput | PrereleaseKitWhereInput[]
    OR?: PrereleaseKitWhereInput[]
    NOT?: PrereleaseKitWhereInput | PrereleaseKitWhereInput[]
    college?: EnumCollegeFilter<"PrereleaseKit"> | $Enums.College
    createdAt?: DateTimeFilter<"PrereleaseKit"> | Date | string
    promoCardId?: StringNullableFilter<"PrereleaseKit"> | string | null
    promoCard?: XOR<CardNullableScalarRelationFilter, CardWhereInput> | null
    placedCards?: PlacedCardListRelationFilter
  }, "id">

  export type PrereleaseKitOrderByWithAggregationInput = {
    id?: SortOrder
    college?: SortOrder
    createdAt?: SortOrder
    promoCardId?: SortOrderInput | SortOrder
    _count?: PrereleaseKitCountOrderByAggregateInput
    _max?: PrereleaseKitMaxOrderByAggregateInput
    _min?: PrereleaseKitMinOrderByAggregateInput
  }

  export type PrereleaseKitScalarWhereWithAggregatesInput = {
    AND?: PrereleaseKitScalarWhereWithAggregatesInput | PrereleaseKitScalarWhereWithAggregatesInput[]
    OR?: PrereleaseKitScalarWhereWithAggregatesInput[]
    NOT?: PrereleaseKitScalarWhereWithAggregatesInput | PrereleaseKitScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PrereleaseKit"> | string
    college?: EnumCollegeWithAggregatesFilter<"PrereleaseKit"> | $Enums.College
    createdAt?: DateTimeWithAggregatesFilter<"PrereleaseKit"> | Date | string
    promoCardId?: StringNullableWithAggregatesFilter<"PrereleaseKit"> | string | null
  }

  export type PlacedCardWhereInput = {
    AND?: PlacedCardWhereInput | PlacedCardWhereInput[]
    OR?: PlacedCardWhereInput[]
    NOT?: PlacedCardWhereInput | PlacedCardWhereInput[]
    id?: StringFilter<"PlacedCard"> | string
    cardId?: StringFilter<"PlacedCard"> | string
    kitId?: StringFilter<"PlacedCard"> | string
    posX?: FloatFilter<"PlacedCard"> | number
    posY?: FloatFilter<"PlacedCard"> | number
    zIndex?: IntFilter<"PlacedCard"> | number
    isMainDeck?: BoolFilter<"PlacedCard"> | boolean
    isFoil?: BoolFilter<"PlacedCard"> | boolean
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
    kit?: XOR<PrereleaseKitScalarRelationFilter, PrereleaseKitWhereInput>
  }

  export type PlacedCardOrderByWithRelationInput = {
    id?: SortOrder
    cardId?: SortOrder
    kitId?: SortOrder
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
    isMainDeck?: SortOrder
    isFoil?: SortOrder
    card?: CardOrderByWithRelationInput
    kit?: PrereleaseKitOrderByWithRelationInput
  }

  export type PlacedCardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PlacedCardWhereInput | PlacedCardWhereInput[]
    OR?: PlacedCardWhereInput[]
    NOT?: PlacedCardWhereInput | PlacedCardWhereInput[]
    cardId?: StringFilter<"PlacedCard"> | string
    kitId?: StringFilter<"PlacedCard"> | string
    posX?: FloatFilter<"PlacedCard"> | number
    posY?: FloatFilter<"PlacedCard"> | number
    zIndex?: IntFilter<"PlacedCard"> | number
    isMainDeck?: BoolFilter<"PlacedCard"> | boolean
    isFoil?: BoolFilter<"PlacedCard"> | boolean
    card?: XOR<CardScalarRelationFilter, CardWhereInput>
    kit?: XOR<PrereleaseKitScalarRelationFilter, PrereleaseKitWhereInput>
  }, "id">

  export type PlacedCardOrderByWithAggregationInput = {
    id?: SortOrder
    cardId?: SortOrder
    kitId?: SortOrder
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
    isMainDeck?: SortOrder
    isFoil?: SortOrder
    _count?: PlacedCardCountOrderByAggregateInput
    _avg?: PlacedCardAvgOrderByAggregateInput
    _max?: PlacedCardMaxOrderByAggregateInput
    _min?: PlacedCardMinOrderByAggregateInput
    _sum?: PlacedCardSumOrderByAggregateInput
  }

  export type PlacedCardScalarWhereWithAggregatesInput = {
    AND?: PlacedCardScalarWhereWithAggregatesInput | PlacedCardScalarWhereWithAggregatesInput[]
    OR?: PlacedCardScalarWhereWithAggregatesInput[]
    NOT?: PlacedCardScalarWhereWithAggregatesInput | PlacedCardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlacedCard"> | string
    cardId?: StringWithAggregatesFilter<"PlacedCard"> | string
    kitId?: StringWithAggregatesFilter<"PlacedCard"> | string
    posX?: FloatWithAggregatesFilter<"PlacedCard"> | number
    posY?: FloatWithAggregatesFilter<"PlacedCard"> | number
    zIndex?: IntWithAggregatesFilter<"PlacedCard"> | number
    isMainDeck?: BoolWithAggregatesFilter<"PlacedCard"> | boolean
    isFoil?: BoolWithAggregatesFilter<"PlacedCard"> | boolean
  }

  export type CardCreateInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    placedCards?: PlacedCardCreateNestedManyWithoutCardInput
    promoInKits?: PrereleaseKitCreateNestedManyWithoutPromoCardInput
  }

  export type CardUncheckedCreateInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    placedCards?: PlacedCardUncheckedCreateNestedManyWithoutCardInput
    promoInKits?: PrereleaseKitUncheckedCreateNestedManyWithoutPromoCardInput
  }

  export type CardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
    placedCards?: PlacedCardUpdateManyWithoutCardNestedInput
    promoInKits?: PrereleaseKitUpdateManyWithoutPromoCardNestedInput
  }

  export type CardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
    placedCards?: PlacedCardUncheckedUpdateManyWithoutCardNestedInput
    promoInKits?: PrereleaseKitUncheckedUpdateManyWithoutPromoCardNestedInput
  }

  export type CardCreateManyInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
  }

  export type CardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
  }

  export type CardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
  }

  export type PrereleaseKitCreateInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    promoCard?: CardCreateNestedOneWithoutPromoInKitsInput
    placedCards?: PlacedCardCreateNestedManyWithoutKitInput
  }

  export type PrereleaseKitUncheckedCreateInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    promoCardId?: string | null
    placedCards?: PlacedCardUncheckedCreateNestedManyWithoutKitInput
  }

  export type PrereleaseKitUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    promoCard?: CardUpdateOneWithoutPromoInKitsNestedInput
    placedCards?: PlacedCardUpdateManyWithoutKitNestedInput
  }

  export type PrereleaseKitUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    promoCardId?: NullableStringFieldUpdateOperationsInput | string | null
    placedCards?: PlacedCardUncheckedUpdateManyWithoutKitNestedInput
  }

  export type PrereleaseKitCreateManyInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    promoCardId?: string | null
  }

  export type PrereleaseKitUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PrereleaseKitUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    promoCardId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlacedCardCreateInput = {
    id?: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
    card: CardCreateNestedOneWithoutPlacedCardsInput
    kit: PrereleaseKitCreateNestedOneWithoutPlacedCardsInput
  }

  export type PlacedCardUncheckedCreateInput = {
    id?: string
    cardId: string
    kitId: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PlacedCardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
    card?: CardUpdateOneRequiredWithoutPlacedCardsNestedInput
    kit?: PrereleaseKitUpdateOneRequiredWithoutPlacedCardsNestedInput
  }

  export type PlacedCardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cardId?: StringFieldUpdateOperationsInput | string
    kitId?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PlacedCardCreateManyInput = {
    id?: string
    cardId: string
    kitId: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PlacedCardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PlacedCardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cardId?: StringFieldUpdateOperationsInput | string
    kitId?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRarityFilter<$PrismaModel = never> = {
    equals?: $Enums.Rarity | EnumRarityFieldRefInput<$PrismaModel>
    in?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    not?: NestedEnumRarityFilter<$PrismaModel> | $Enums.Rarity
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type PlacedCardListRelationFilter = {
    every?: PlacedCardWhereInput
    some?: PlacedCardWhereInput
    none?: PlacedCardWhereInput
  }

  export type PrereleaseKitListRelationFilter = {
    every?: PrereleaseKitWhereInput
    some?: PrereleaseKitWhereInput
    none?: PrereleaseKitWhereInput
  }

  export type PlacedCardOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PrereleaseKitOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CardCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    scryfallId?: SortOrder
    rarity?: SortOrder
    set?: SortOrder
    colors?: SortOrder
    cmc?: SortOrder
    typeLine?: SortOrder
    imagePath?: SortOrder
    collectorNumber?: SortOrder
  }

  export type CardAvgOrderByAggregateInput = {
    cmc?: SortOrder
  }

  export type CardMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    scryfallId?: SortOrder
    rarity?: SortOrder
    set?: SortOrder
    cmc?: SortOrder
    typeLine?: SortOrder
    imagePath?: SortOrder
    collectorNumber?: SortOrder
  }

  export type CardMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    scryfallId?: SortOrder
    rarity?: SortOrder
    set?: SortOrder
    cmc?: SortOrder
    typeLine?: SortOrder
    imagePath?: SortOrder
    collectorNumber?: SortOrder
  }

  export type CardSumOrderByAggregateInput = {
    cmc?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRarityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Rarity | EnumRarityFieldRefInput<$PrismaModel>
    in?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    not?: NestedEnumRarityWithAggregatesFilter<$PrismaModel> | $Enums.Rarity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRarityFilter<$PrismaModel>
    _max?: NestedEnumRarityFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumCollegeFilter<$PrismaModel = never> = {
    equals?: $Enums.College | EnumCollegeFieldRefInput<$PrismaModel>
    in?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    notIn?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    not?: NestedEnumCollegeFilter<$PrismaModel> | $Enums.College
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type CardNullableScalarRelationFilter = {
    is?: CardWhereInput | null
    isNot?: CardWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PrereleaseKitCountOrderByAggregateInput = {
    id?: SortOrder
    college?: SortOrder
    createdAt?: SortOrder
    promoCardId?: SortOrder
  }

  export type PrereleaseKitMaxOrderByAggregateInput = {
    id?: SortOrder
    college?: SortOrder
    createdAt?: SortOrder
    promoCardId?: SortOrder
  }

  export type PrereleaseKitMinOrderByAggregateInput = {
    id?: SortOrder
    college?: SortOrder
    createdAt?: SortOrder
    promoCardId?: SortOrder
  }

  export type EnumCollegeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.College | EnumCollegeFieldRefInput<$PrismaModel>
    in?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    notIn?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    not?: NestedEnumCollegeWithAggregatesFilter<$PrismaModel> | $Enums.College
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCollegeFilter<$PrismaModel>
    _max?: NestedEnumCollegeFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type CardScalarRelationFilter = {
    is?: CardWhereInput
    isNot?: CardWhereInput
  }

  export type PrereleaseKitScalarRelationFilter = {
    is?: PrereleaseKitWhereInput
    isNot?: PrereleaseKitWhereInput
  }

  export type PlacedCardCountOrderByAggregateInput = {
    id?: SortOrder
    cardId?: SortOrder
    kitId?: SortOrder
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
    isMainDeck?: SortOrder
    isFoil?: SortOrder
  }

  export type PlacedCardAvgOrderByAggregateInput = {
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
  }

  export type PlacedCardMaxOrderByAggregateInput = {
    id?: SortOrder
    cardId?: SortOrder
    kitId?: SortOrder
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
    isMainDeck?: SortOrder
    isFoil?: SortOrder
  }

  export type PlacedCardMinOrderByAggregateInput = {
    id?: SortOrder
    cardId?: SortOrder
    kitId?: SortOrder
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
    isMainDeck?: SortOrder
    isFoil?: SortOrder
  }

  export type PlacedCardSumOrderByAggregateInput = {
    posX?: SortOrder
    posY?: SortOrder
    zIndex?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PlacedCardCreateNestedManyWithoutCardInput = {
    create?: XOR<PlacedCardCreateWithoutCardInput, PlacedCardUncheckedCreateWithoutCardInput> | PlacedCardCreateWithoutCardInput[] | PlacedCardUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutCardInput | PlacedCardCreateOrConnectWithoutCardInput[]
    createMany?: PlacedCardCreateManyCardInputEnvelope
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
  }

  export type PrereleaseKitCreateNestedManyWithoutPromoCardInput = {
    create?: XOR<PrereleaseKitCreateWithoutPromoCardInput, PrereleaseKitUncheckedCreateWithoutPromoCardInput> | PrereleaseKitCreateWithoutPromoCardInput[] | PrereleaseKitUncheckedCreateWithoutPromoCardInput[]
    connectOrCreate?: PrereleaseKitCreateOrConnectWithoutPromoCardInput | PrereleaseKitCreateOrConnectWithoutPromoCardInput[]
    createMany?: PrereleaseKitCreateManyPromoCardInputEnvelope
    connect?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
  }

  export type PlacedCardUncheckedCreateNestedManyWithoutCardInput = {
    create?: XOR<PlacedCardCreateWithoutCardInput, PlacedCardUncheckedCreateWithoutCardInput> | PlacedCardCreateWithoutCardInput[] | PlacedCardUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutCardInput | PlacedCardCreateOrConnectWithoutCardInput[]
    createMany?: PlacedCardCreateManyCardInputEnvelope
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
  }

  export type PrereleaseKitUncheckedCreateNestedManyWithoutPromoCardInput = {
    create?: XOR<PrereleaseKitCreateWithoutPromoCardInput, PrereleaseKitUncheckedCreateWithoutPromoCardInput> | PrereleaseKitCreateWithoutPromoCardInput[] | PrereleaseKitUncheckedCreateWithoutPromoCardInput[]
    connectOrCreate?: PrereleaseKitCreateOrConnectWithoutPromoCardInput | PrereleaseKitCreateOrConnectWithoutPromoCardInput[]
    createMany?: PrereleaseKitCreateManyPromoCardInputEnvelope
    connect?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRarityFieldUpdateOperationsInput = {
    set?: $Enums.Rarity
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PlacedCardUpdateManyWithoutCardNestedInput = {
    create?: XOR<PlacedCardCreateWithoutCardInput, PlacedCardUncheckedCreateWithoutCardInput> | PlacedCardCreateWithoutCardInput[] | PlacedCardUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutCardInput | PlacedCardCreateOrConnectWithoutCardInput[]
    upsert?: PlacedCardUpsertWithWhereUniqueWithoutCardInput | PlacedCardUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: PlacedCardCreateManyCardInputEnvelope
    set?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    disconnect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    delete?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    update?: PlacedCardUpdateWithWhereUniqueWithoutCardInput | PlacedCardUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: PlacedCardUpdateManyWithWhereWithoutCardInput | PlacedCardUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: PlacedCardScalarWhereInput | PlacedCardScalarWhereInput[]
  }

  export type PrereleaseKitUpdateManyWithoutPromoCardNestedInput = {
    create?: XOR<PrereleaseKitCreateWithoutPromoCardInput, PrereleaseKitUncheckedCreateWithoutPromoCardInput> | PrereleaseKitCreateWithoutPromoCardInput[] | PrereleaseKitUncheckedCreateWithoutPromoCardInput[]
    connectOrCreate?: PrereleaseKitCreateOrConnectWithoutPromoCardInput | PrereleaseKitCreateOrConnectWithoutPromoCardInput[]
    upsert?: PrereleaseKitUpsertWithWhereUniqueWithoutPromoCardInput | PrereleaseKitUpsertWithWhereUniqueWithoutPromoCardInput[]
    createMany?: PrereleaseKitCreateManyPromoCardInputEnvelope
    set?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    disconnect?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    delete?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    connect?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    update?: PrereleaseKitUpdateWithWhereUniqueWithoutPromoCardInput | PrereleaseKitUpdateWithWhereUniqueWithoutPromoCardInput[]
    updateMany?: PrereleaseKitUpdateManyWithWhereWithoutPromoCardInput | PrereleaseKitUpdateManyWithWhereWithoutPromoCardInput[]
    deleteMany?: PrereleaseKitScalarWhereInput | PrereleaseKitScalarWhereInput[]
  }

  export type PlacedCardUncheckedUpdateManyWithoutCardNestedInput = {
    create?: XOR<PlacedCardCreateWithoutCardInput, PlacedCardUncheckedCreateWithoutCardInput> | PlacedCardCreateWithoutCardInput[] | PlacedCardUncheckedCreateWithoutCardInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutCardInput | PlacedCardCreateOrConnectWithoutCardInput[]
    upsert?: PlacedCardUpsertWithWhereUniqueWithoutCardInput | PlacedCardUpsertWithWhereUniqueWithoutCardInput[]
    createMany?: PlacedCardCreateManyCardInputEnvelope
    set?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    disconnect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    delete?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    update?: PlacedCardUpdateWithWhereUniqueWithoutCardInput | PlacedCardUpdateWithWhereUniqueWithoutCardInput[]
    updateMany?: PlacedCardUpdateManyWithWhereWithoutCardInput | PlacedCardUpdateManyWithWhereWithoutCardInput[]
    deleteMany?: PlacedCardScalarWhereInput | PlacedCardScalarWhereInput[]
  }

  export type PrereleaseKitUncheckedUpdateManyWithoutPromoCardNestedInput = {
    create?: XOR<PrereleaseKitCreateWithoutPromoCardInput, PrereleaseKitUncheckedCreateWithoutPromoCardInput> | PrereleaseKitCreateWithoutPromoCardInput[] | PrereleaseKitUncheckedCreateWithoutPromoCardInput[]
    connectOrCreate?: PrereleaseKitCreateOrConnectWithoutPromoCardInput | PrereleaseKitCreateOrConnectWithoutPromoCardInput[]
    upsert?: PrereleaseKitUpsertWithWhereUniqueWithoutPromoCardInput | PrereleaseKitUpsertWithWhereUniqueWithoutPromoCardInput[]
    createMany?: PrereleaseKitCreateManyPromoCardInputEnvelope
    set?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    disconnect?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    delete?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    connect?: PrereleaseKitWhereUniqueInput | PrereleaseKitWhereUniqueInput[]
    update?: PrereleaseKitUpdateWithWhereUniqueWithoutPromoCardInput | PrereleaseKitUpdateWithWhereUniqueWithoutPromoCardInput[]
    updateMany?: PrereleaseKitUpdateManyWithWhereWithoutPromoCardInput | PrereleaseKitUpdateManyWithWhereWithoutPromoCardInput[]
    deleteMany?: PrereleaseKitScalarWhereInput | PrereleaseKitScalarWhereInput[]
  }

  export type CardCreateNestedOneWithoutPromoInKitsInput = {
    create?: XOR<CardCreateWithoutPromoInKitsInput, CardUncheckedCreateWithoutPromoInKitsInput>
    connectOrCreate?: CardCreateOrConnectWithoutPromoInKitsInput
    connect?: CardWhereUniqueInput
  }

  export type PlacedCardCreateNestedManyWithoutKitInput = {
    create?: XOR<PlacedCardCreateWithoutKitInput, PlacedCardUncheckedCreateWithoutKitInput> | PlacedCardCreateWithoutKitInput[] | PlacedCardUncheckedCreateWithoutKitInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutKitInput | PlacedCardCreateOrConnectWithoutKitInput[]
    createMany?: PlacedCardCreateManyKitInputEnvelope
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
  }

  export type PlacedCardUncheckedCreateNestedManyWithoutKitInput = {
    create?: XOR<PlacedCardCreateWithoutKitInput, PlacedCardUncheckedCreateWithoutKitInput> | PlacedCardCreateWithoutKitInput[] | PlacedCardUncheckedCreateWithoutKitInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutKitInput | PlacedCardCreateOrConnectWithoutKitInput[]
    createMany?: PlacedCardCreateManyKitInputEnvelope
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
  }

  export type EnumCollegeFieldUpdateOperationsInput = {
    set?: $Enums.College
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CardUpdateOneWithoutPromoInKitsNestedInput = {
    create?: XOR<CardCreateWithoutPromoInKitsInput, CardUncheckedCreateWithoutPromoInKitsInput>
    connectOrCreate?: CardCreateOrConnectWithoutPromoInKitsInput
    upsert?: CardUpsertWithoutPromoInKitsInput
    disconnect?: CardWhereInput | boolean
    delete?: CardWhereInput | boolean
    connect?: CardWhereUniqueInput
    update?: XOR<XOR<CardUpdateToOneWithWhereWithoutPromoInKitsInput, CardUpdateWithoutPromoInKitsInput>, CardUncheckedUpdateWithoutPromoInKitsInput>
  }

  export type PlacedCardUpdateManyWithoutKitNestedInput = {
    create?: XOR<PlacedCardCreateWithoutKitInput, PlacedCardUncheckedCreateWithoutKitInput> | PlacedCardCreateWithoutKitInput[] | PlacedCardUncheckedCreateWithoutKitInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutKitInput | PlacedCardCreateOrConnectWithoutKitInput[]
    upsert?: PlacedCardUpsertWithWhereUniqueWithoutKitInput | PlacedCardUpsertWithWhereUniqueWithoutKitInput[]
    createMany?: PlacedCardCreateManyKitInputEnvelope
    set?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    disconnect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    delete?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    update?: PlacedCardUpdateWithWhereUniqueWithoutKitInput | PlacedCardUpdateWithWhereUniqueWithoutKitInput[]
    updateMany?: PlacedCardUpdateManyWithWhereWithoutKitInput | PlacedCardUpdateManyWithWhereWithoutKitInput[]
    deleteMany?: PlacedCardScalarWhereInput | PlacedCardScalarWhereInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type PlacedCardUncheckedUpdateManyWithoutKitNestedInput = {
    create?: XOR<PlacedCardCreateWithoutKitInput, PlacedCardUncheckedCreateWithoutKitInput> | PlacedCardCreateWithoutKitInput[] | PlacedCardUncheckedCreateWithoutKitInput[]
    connectOrCreate?: PlacedCardCreateOrConnectWithoutKitInput | PlacedCardCreateOrConnectWithoutKitInput[]
    upsert?: PlacedCardUpsertWithWhereUniqueWithoutKitInput | PlacedCardUpsertWithWhereUniqueWithoutKitInput[]
    createMany?: PlacedCardCreateManyKitInputEnvelope
    set?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    disconnect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    delete?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    connect?: PlacedCardWhereUniqueInput | PlacedCardWhereUniqueInput[]
    update?: PlacedCardUpdateWithWhereUniqueWithoutKitInput | PlacedCardUpdateWithWhereUniqueWithoutKitInput[]
    updateMany?: PlacedCardUpdateManyWithWhereWithoutKitInput | PlacedCardUpdateManyWithWhereWithoutKitInput[]
    deleteMany?: PlacedCardScalarWhereInput | PlacedCardScalarWhereInput[]
  }

  export type CardCreateNestedOneWithoutPlacedCardsInput = {
    create?: XOR<CardCreateWithoutPlacedCardsInput, CardUncheckedCreateWithoutPlacedCardsInput>
    connectOrCreate?: CardCreateOrConnectWithoutPlacedCardsInput
    connect?: CardWhereUniqueInput
  }

  export type PrereleaseKitCreateNestedOneWithoutPlacedCardsInput = {
    create?: XOR<PrereleaseKitCreateWithoutPlacedCardsInput, PrereleaseKitUncheckedCreateWithoutPlacedCardsInput>
    connectOrCreate?: PrereleaseKitCreateOrConnectWithoutPlacedCardsInput
    connect?: PrereleaseKitWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type CardUpdateOneRequiredWithoutPlacedCardsNestedInput = {
    create?: XOR<CardCreateWithoutPlacedCardsInput, CardUncheckedCreateWithoutPlacedCardsInput>
    connectOrCreate?: CardCreateOrConnectWithoutPlacedCardsInput
    upsert?: CardUpsertWithoutPlacedCardsInput
    connect?: CardWhereUniqueInput
    update?: XOR<XOR<CardUpdateToOneWithWhereWithoutPlacedCardsInput, CardUpdateWithoutPlacedCardsInput>, CardUncheckedUpdateWithoutPlacedCardsInput>
  }

  export type PrereleaseKitUpdateOneRequiredWithoutPlacedCardsNestedInput = {
    create?: XOR<PrereleaseKitCreateWithoutPlacedCardsInput, PrereleaseKitUncheckedCreateWithoutPlacedCardsInput>
    connectOrCreate?: PrereleaseKitCreateOrConnectWithoutPlacedCardsInput
    upsert?: PrereleaseKitUpsertWithoutPlacedCardsInput
    connect?: PrereleaseKitWhereUniqueInput
    update?: XOR<XOR<PrereleaseKitUpdateToOneWithWhereWithoutPlacedCardsInput, PrereleaseKitUpdateWithoutPlacedCardsInput>, PrereleaseKitUncheckedUpdateWithoutPlacedCardsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRarityFilter<$PrismaModel = never> = {
    equals?: $Enums.Rarity | EnumRarityFieldRefInput<$PrismaModel>
    in?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    not?: NestedEnumRarityFilter<$PrismaModel> | $Enums.Rarity
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumRarityWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Rarity | EnumRarityFieldRefInput<$PrismaModel>
    in?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    notIn?: $Enums.Rarity[] | ListEnumRarityFieldRefInput<$PrismaModel>
    not?: NestedEnumRarityWithAggregatesFilter<$PrismaModel> | $Enums.Rarity
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRarityFilter<$PrismaModel>
    _max?: NestedEnumRarityFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumCollegeFilter<$PrismaModel = never> = {
    equals?: $Enums.College | EnumCollegeFieldRefInput<$PrismaModel>
    in?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    notIn?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    not?: NestedEnumCollegeFilter<$PrismaModel> | $Enums.College
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumCollegeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.College | EnumCollegeFieldRefInput<$PrismaModel>
    in?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    notIn?: $Enums.College[] | ListEnumCollegeFieldRefInput<$PrismaModel>
    not?: NestedEnumCollegeWithAggregatesFilter<$PrismaModel> | $Enums.College
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCollegeFilter<$PrismaModel>
    _max?: NestedEnumCollegeFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type PlacedCardCreateWithoutCardInput = {
    id?: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
    kit: PrereleaseKitCreateNestedOneWithoutPlacedCardsInput
  }

  export type PlacedCardUncheckedCreateWithoutCardInput = {
    id?: string
    kitId: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PlacedCardCreateOrConnectWithoutCardInput = {
    where: PlacedCardWhereUniqueInput
    create: XOR<PlacedCardCreateWithoutCardInput, PlacedCardUncheckedCreateWithoutCardInput>
  }

  export type PlacedCardCreateManyCardInputEnvelope = {
    data: PlacedCardCreateManyCardInput | PlacedCardCreateManyCardInput[]
    skipDuplicates?: boolean
  }

  export type PrereleaseKitCreateWithoutPromoCardInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    placedCards?: PlacedCardCreateNestedManyWithoutKitInput
  }

  export type PrereleaseKitUncheckedCreateWithoutPromoCardInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    placedCards?: PlacedCardUncheckedCreateNestedManyWithoutKitInput
  }

  export type PrereleaseKitCreateOrConnectWithoutPromoCardInput = {
    where: PrereleaseKitWhereUniqueInput
    create: XOR<PrereleaseKitCreateWithoutPromoCardInput, PrereleaseKitUncheckedCreateWithoutPromoCardInput>
  }

  export type PrereleaseKitCreateManyPromoCardInputEnvelope = {
    data: PrereleaseKitCreateManyPromoCardInput | PrereleaseKitCreateManyPromoCardInput[]
    skipDuplicates?: boolean
  }

  export type PlacedCardUpsertWithWhereUniqueWithoutCardInput = {
    where: PlacedCardWhereUniqueInput
    update: XOR<PlacedCardUpdateWithoutCardInput, PlacedCardUncheckedUpdateWithoutCardInput>
    create: XOR<PlacedCardCreateWithoutCardInput, PlacedCardUncheckedCreateWithoutCardInput>
  }

  export type PlacedCardUpdateWithWhereUniqueWithoutCardInput = {
    where: PlacedCardWhereUniqueInput
    data: XOR<PlacedCardUpdateWithoutCardInput, PlacedCardUncheckedUpdateWithoutCardInput>
  }

  export type PlacedCardUpdateManyWithWhereWithoutCardInput = {
    where: PlacedCardScalarWhereInput
    data: XOR<PlacedCardUpdateManyMutationInput, PlacedCardUncheckedUpdateManyWithoutCardInput>
  }

  export type PlacedCardScalarWhereInput = {
    AND?: PlacedCardScalarWhereInput | PlacedCardScalarWhereInput[]
    OR?: PlacedCardScalarWhereInput[]
    NOT?: PlacedCardScalarWhereInput | PlacedCardScalarWhereInput[]
    id?: StringFilter<"PlacedCard"> | string
    cardId?: StringFilter<"PlacedCard"> | string
    kitId?: StringFilter<"PlacedCard"> | string
    posX?: FloatFilter<"PlacedCard"> | number
    posY?: FloatFilter<"PlacedCard"> | number
    zIndex?: IntFilter<"PlacedCard"> | number
    isMainDeck?: BoolFilter<"PlacedCard"> | boolean
    isFoil?: BoolFilter<"PlacedCard"> | boolean
  }

  export type PrereleaseKitUpsertWithWhereUniqueWithoutPromoCardInput = {
    where: PrereleaseKitWhereUniqueInput
    update: XOR<PrereleaseKitUpdateWithoutPromoCardInput, PrereleaseKitUncheckedUpdateWithoutPromoCardInput>
    create: XOR<PrereleaseKitCreateWithoutPromoCardInput, PrereleaseKitUncheckedCreateWithoutPromoCardInput>
  }

  export type PrereleaseKitUpdateWithWhereUniqueWithoutPromoCardInput = {
    where: PrereleaseKitWhereUniqueInput
    data: XOR<PrereleaseKitUpdateWithoutPromoCardInput, PrereleaseKitUncheckedUpdateWithoutPromoCardInput>
  }

  export type PrereleaseKitUpdateManyWithWhereWithoutPromoCardInput = {
    where: PrereleaseKitScalarWhereInput
    data: XOR<PrereleaseKitUpdateManyMutationInput, PrereleaseKitUncheckedUpdateManyWithoutPromoCardInput>
  }

  export type PrereleaseKitScalarWhereInput = {
    AND?: PrereleaseKitScalarWhereInput | PrereleaseKitScalarWhereInput[]
    OR?: PrereleaseKitScalarWhereInput[]
    NOT?: PrereleaseKitScalarWhereInput | PrereleaseKitScalarWhereInput[]
    id?: StringFilter<"PrereleaseKit"> | string
    college?: EnumCollegeFilter<"PrereleaseKit"> | $Enums.College
    createdAt?: DateTimeFilter<"PrereleaseKit"> | Date | string
    promoCardId?: StringNullableFilter<"PrereleaseKit"> | string | null
  }

  export type CardCreateWithoutPromoInKitsInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    placedCards?: PlacedCardCreateNestedManyWithoutCardInput
  }

  export type CardUncheckedCreateWithoutPromoInKitsInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    placedCards?: PlacedCardUncheckedCreateNestedManyWithoutCardInput
  }

  export type CardCreateOrConnectWithoutPromoInKitsInput = {
    where: CardWhereUniqueInput
    create: XOR<CardCreateWithoutPromoInKitsInput, CardUncheckedCreateWithoutPromoInKitsInput>
  }

  export type PlacedCardCreateWithoutKitInput = {
    id?: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
    card: CardCreateNestedOneWithoutPlacedCardsInput
  }

  export type PlacedCardUncheckedCreateWithoutKitInput = {
    id?: string
    cardId: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PlacedCardCreateOrConnectWithoutKitInput = {
    where: PlacedCardWhereUniqueInput
    create: XOR<PlacedCardCreateWithoutKitInput, PlacedCardUncheckedCreateWithoutKitInput>
  }

  export type PlacedCardCreateManyKitInputEnvelope = {
    data: PlacedCardCreateManyKitInput | PlacedCardCreateManyKitInput[]
    skipDuplicates?: boolean
  }

  export type CardUpsertWithoutPromoInKitsInput = {
    update: XOR<CardUpdateWithoutPromoInKitsInput, CardUncheckedUpdateWithoutPromoInKitsInput>
    create: XOR<CardCreateWithoutPromoInKitsInput, CardUncheckedCreateWithoutPromoInKitsInput>
    where?: CardWhereInput
  }

  export type CardUpdateToOneWithWhereWithoutPromoInKitsInput = {
    where?: CardWhereInput
    data: XOR<CardUpdateWithoutPromoInKitsInput, CardUncheckedUpdateWithoutPromoInKitsInput>
  }

  export type CardUpdateWithoutPromoInKitsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
    placedCards?: PlacedCardUpdateManyWithoutCardNestedInput
  }

  export type CardUncheckedUpdateWithoutPromoInKitsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
    placedCards?: PlacedCardUncheckedUpdateManyWithoutCardNestedInput
  }

  export type PlacedCardUpsertWithWhereUniqueWithoutKitInput = {
    where: PlacedCardWhereUniqueInput
    update: XOR<PlacedCardUpdateWithoutKitInput, PlacedCardUncheckedUpdateWithoutKitInput>
    create: XOR<PlacedCardCreateWithoutKitInput, PlacedCardUncheckedCreateWithoutKitInput>
  }

  export type PlacedCardUpdateWithWhereUniqueWithoutKitInput = {
    where: PlacedCardWhereUniqueInput
    data: XOR<PlacedCardUpdateWithoutKitInput, PlacedCardUncheckedUpdateWithoutKitInput>
  }

  export type PlacedCardUpdateManyWithWhereWithoutKitInput = {
    where: PlacedCardScalarWhereInput
    data: XOR<PlacedCardUpdateManyMutationInput, PlacedCardUncheckedUpdateManyWithoutKitInput>
  }

  export type CardCreateWithoutPlacedCardsInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    promoInKits?: PrereleaseKitCreateNestedManyWithoutPromoCardInput
  }

  export type CardUncheckedCreateWithoutPlacedCardsInput = {
    id?: string
    name: string
    scryfallId: string
    rarity: $Enums.Rarity
    set: string
    colors: JsonNullValueInput | InputJsonValue
    cmc: number
    typeLine: string
    imagePath: string
    collectorNumber: string
    promoInKits?: PrereleaseKitUncheckedCreateNestedManyWithoutPromoCardInput
  }

  export type CardCreateOrConnectWithoutPlacedCardsInput = {
    where: CardWhereUniqueInput
    create: XOR<CardCreateWithoutPlacedCardsInput, CardUncheckedCreateWithoutPlacedCardsInput>
  }

  export type PrereleaseKitCreateWithoutPlacedCardsInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    promoCard?: CardCreateNestedOneWithoutPromoInKitsInput
  }

  export type PrereleaseKitUncheckedCreateWithoutPlacedCardsInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
    promoCardId?: string | null
  }

  export type PrereleaseKitCreateOrConnectWithoutPlacedCardsInput = {
    where: PrereleaseKitWhereUniqueInput
    create: XOR<PrereleaseKitCreateWithoutPlacedCardsInput, PrereleaseKitUncheckedCreateWithoutPlacedCardsInput>
  }

  export type CardUpsertWithoutPlacedCardsInput = {
    update: XOR<CardUpdateWithoutPlacedCardsInput, CardUncheckedUpdateWithoutPlacedCardsInput>
    create: XOR<CardCreateWithoutPlacedCardsInput, CardUncheckedCreateWithoutPlacedCardsInput>
    where?: CardWhereInput
  }

  export type CardUpdateToOneWithWhereWithoutPlacedCardsInput = {
    where?: CardWhereInput
    data: XOR<CardUpdateWithoutPlacedCardsInput, CardUncheckedUpdateWithoutPlacedCardsInput>
  }

  export type CardUpdateWithoutPlacedCardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
    promoInKits?: PrereleaseKitUpdateManyWithoutPromoCardNestedInput
  }

  export type CardUncheckedUpdateWithoutPlacedCardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    scryfallId?: StringFieldUpdateOperationsInput | string
    rarity?: EnumRarityFieldUpdateOperationsInput | $Enums.Rarity
    set?: StringFieldUpdateOperationsInput | string
    colors?: JsonNullValueInput | InputJsonValue
    cmc?: IntFieldUpdateOperationsInput | number
    typeLine?: StringFieldUpdateOperationsInput | string
    imagePath?: StringFieldUpdateOperationsInput | string
    collectorNumber?: StringFieldUpdateOperationsInput | string
    promoInKits?: PrereleaseKitUncheckedUpdateManyWithoutPromoCardNestedInput
  }

  export type PrereleaseKitUpsertWithoutPlacedCardsInput = {
    update: XOR<PrereleaseKitUpdateWithoutPlacedCardsInput, PrereleaseKitUncheckedUpdateWithoutPlacedCardsInput>
    create: XOR<PrereleaseKitCreateWithoutPlacedCardsInput, PrereleaseKitUncheckedCreateWithoutPlacedCardsInput>
    where?: PrereleaseKitWhereInput
  }

  export type PrereleaseKitUpdateToOneWithWhereWithoutPlacedCardsInput = {
    where?: PrereleaseKitWhereInput
    data: XOR<PrereleaseKitUpdateWithoutPlacedCardsInput, PrereleaseKitUncheckedUpdateWithoutPlacedCardsInput>
  }

  export type PrereleaseKitUpdateWithoutPlacedCardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    promoCard?: CardUpdateOneWithoutPromoInKitsNestedInput
  }

  export type PrereleaseKitUncheckedUpdateWithoutPlacedCardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    promoCardId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlacedCardCreateManyCardInput = {
    id?: string
    kitId: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PrereleaseKitCreateManyPromoCardInput = {
    id?: string
    college: $Enums.College
    createdAt?: Date | string
  }

  export type PlacedCardUpdateWithoutCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
    kit?: PrereleaseKitUpdateOneRequiredWithoutPlacedCardsNestedInput
  }

  export type PlacedCardUncheckedUpdateWithoutCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    kitId?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PlacedCardUncheckedUpdateManyWithoutCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    kitId?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PrereleaseKitUpdateWithoutPromoCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    placedCards?: PlacedCardUpdateManyWithoutKitNestedInput
  }

  export type PrereleaseKitUncheckedUpdateWithoutPromoCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    placedCards?: PlacedCardUncheckedUpdateManyWithoutKitNestedInput
  }

  export type PrereleaseKitUncheckedUpdateManyWithoutPromoCardInput = {
    id?: StringFieldUpdateOperationsInput | string
    college?: EnumCollegeFieldUpdateOperationsInput | $Enums.College
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlacedCardCreateManyKitInput = {
    id?: string
    cardId: string
    posX?: number
    posY?: number
    zIndex?: number
    isMainDeck?: boolean
    isFoil?: boolean
  }

  export type PlacedCardUpdateWithoutKitInput = {
    id?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
    card?: CardUpdateOneRequiredWithoutPlacedCardsNestedInput
  }

  export type PlacedCardUncheckedUpdateWithoutKitInput = {
    id?: StringFieldUpdateOperationsInput | string
    cardId?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PlacedCardUncheckedUpdateManyWithoutKitInput = {
    id?: StringFieldUpdateOperationsInput | string
    cardId?: StringFieldUpdateOperationsInput | string
    posX?: FloatFieldUpdateOperationsInput | number
    posY?: FloatFieldUpdateOperationsInput | number
    zIndex?: IntFieldUpdateOperationsInput | number
    isMainDeck?: BoolFieldUpdateOperationsInput | boolean
    isFoil?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}