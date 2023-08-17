import { z } from "zod";
import type { ZodType } from "zod";

// Uint
export const Uint8Schema = z
  .number()
  .int()
  .nonnegative()
  .lte(255)
  .describe("number");
export const Uint16Schema = z
  .number()
  .int()
  .nonnegative()
  .lte(65535)
  .describe("number");
export const Uint24Schema = z
  .number()
  .int()
  .nonnegative()
  .lte(16777215)
  .describe("number");
export const Uint32Schema = z
  .number()
  .int()
  .nonnegative()
  .lte(4294967295)
  .describe("number");
export const Uint40Schema = z
  .number()
  .int()
  .nonnegative()
  .lte(1099511627775)
  .describe("number");
export const Uint48Schema = z
  .number()
  .int()
  .nonnegative()
  .lte(281474976710655)
  .describe("number");
export const Uint56Schema = z
  .bigint()
  .nonnegative()
  .lte(72057594037927935n)
  .describe("bigint");
export const Uint64Schema = z
  .bigint()
  .nonnegative()
  .lte(18446744073709551615n)
  .describe("bigint");
export const Uint72Schema = z
  .bigint()
  .nonnegative()
  .lte(4722366482869645213695n)
  .describe("bigint");
export const Uint80Schema = z
  .bigint()
  .nonnegative()
  .lte(1208925819614629174706175n)
  .describe("bigint");
export const Uint88Schema = z
  .bigint()
  .nonnegative()
  .lte(309485009821345068724781055n)
  .describe("bigint");
export const Uint96Schema = z
  .bigint()
  .nonnegative()
  .lte(79228162514264337593543950335n)
  .describe("bigint");
export const Uint104Schema = z
  .bigint()
  .nonnegative()
  .lte(20282409603651670423947251286015n)
  .describe("bigint");
export const Uint112Schema = z
  .bigint()
  .nonnegative()
  .lte(5192296858534827628530496329220095n)
  .describe("bigint");
export const Uint120Schema = z
  .bigint()
  .nonnegative()
  .lte(1329227995784915872903807060280344575n)
  .describe("bigint");
export const Uint128Schema = z
  .bigint()
  .nonnegative()
  .lte(340282366920938463463374607431768211455n)
  .describe("bigint");
export const Uint136Schema = z
  .bigint()
  .nonnegative()
  .lte(87112285931760246646623899502532662132735n)
  .describe("bigint");
export const Uint144Schema = z
  .bigint()
  .nonnegative()
  .lte(22300745198530623141535718272648361505980415n)
  .describe("bigint");
export const Uint152Schema = z
  .bigint()
  .nonnegative()
  .lte(5708990770823839524233143877797980545530986495n)
  .describe("bigint");
export const Uint160Schema = z
  .bigint()
  .nonnegative()
  .lte(1461501637330902918203684832716283019655932542975n)
  .describe("bigint");
export const Uint168Schema = z
  .bigint()
  .nonnegative()
  .lte(374144419156711147060143317175368453031918731001855n)
  .describe("bigint");
export const Uint176Schema = z
  .bigint()
  .nonnegative()
  .lte(95780971304118053647396689196894323976171195136475135n)
  .describe("bigint");
export const Uint184Schema = z
  .bigint()
  .nonnegative()
  .lte(24519928653854221733733552434404946937899825954937634815n)
  .describe("bigint");
export const Uint192Schema = z
  .bigint()
  .nonnegative()
  .lte(6277101735386680763835789423207666416102355444464034512895n)
  .describe("bigint");
export const Uint200Schema = z
  .bigint()
  .nonnegative()
  .lte(1606938044258990275541962092341162602522202993782792835301375n)
  .describe("bigint");
export const Uint208Schema = z
  .bigint()
  .nonnegative()
  .lte(411376139330301510538742295639337626245683966408394965837152255n)
  .describe("bigint");
export const Uint216Schema = z
  .bigint()
  .nonnegative()
  .lte(105312291668557186697918027683670432318895095400549111254310977535n)
  .describe("bigint");
export const Uint224Schema = z
  .bigint()
  .nonnegative()
  .lte(26959946667150639794667015087019630673637144422540572481103610249215n)
  .describe("bigint");
export const Uint232Schema = z
  .bigint()
  .nonnegative()
  .lte(6901746346790563787434755862277025452451108972170386555162524223799295n)
  .describe("bigint");
export const Uint240Schema = z
  .bigint()
  .nonnegative()
  .lte(
    1766847064778384329583297500742918515827483896875618958121606201292619775n
  )
  .describe("bigint");
export const Uint248Schema = z
  .bigint()
  .nonnegative()
  .lte(
    452312848583266388373324160190187140051835877600158453279131187530910662655n
  )
  .describe("bigint");
export const Uint256Schema = z
  .bigint()
  .nonnegative()
  .lte(
    115792089237316195423570985008687907853269984665640564039457584007913129639935n
  )
  .describe("bigint");

// Int
export const Int8Schema = z
  .number()
  .int()
  .gte(-128)
  .lte(127)
  .describe("number");
export const Int16Schema = z
  .number()
  .int()
  .gte(-32768)
  .lte(32767)
  .describe("number");
export const Int24Schema = z
  .number()
  .int()
  .gte(-8388608)
  .lte(8388607)
  .describe("number");
export const Int32Schema = z
  .number()
  .int()
  .gte(-2147483648)
  .lte(2147483647)
  .describe("number");
export const Int40Schema = z
  .number()
  .int()
  .gte(-549755813888)
  .lte(549755813887)
  .describe("number");
export const Int48Schema = z
  .number()
  .int()
  .gte(-140737488355328)
  .lte(140737488355327)
  .describe("number");
export const Int56Schema = z
  .bigint()
  .gte(-36028797018963968n)
  .lte(36028797018963967n)
  .describe("bigint");
export const Int64Schema = z
  .bigint()
  .gte(-9223372036854775808n)
  .lte(9223372036854775807n)
  .describe("bigint");
export const Int72Schema = z
  .bigint()
  .gte(-2361183241434822606848n)
  .lte(2361183241434822606847n)
  .describe("bigint");
export const Int80Schema = z
  .bigint()
  .gte(-604462909807314587353088n)
  .lte(604462909807314587353088n)
  .describe("bigint");
export const Int88Schema = z
  .bigint()
  .gte(-154742504910672534362390528n)
  .lte(154742504910672534362390527n)
  .describe("bigint");
export const Int96Schema = z
  .bigint()
  .gte(-39614081257132168796771975168n)
  .lte(39614081257132168796771975168n)
  .describe("bigint");
export const Int104Schema = z
  .bigint()
  .gte(-10141204801825835211973625643008n)
  .lte(10141204801825835211973625643007n)
  .describe("bigint");
export const Int112Schema = z
  .bigint()
  .gte(-2596148429267413814265248164610048n)
  .lte(2596148429267413814265248164610047n)
  .describe("bigint");
export const Int120Schema = z
  .bigint()
  .gte(-664613997892457936451903530140172288n)
  .lte(664613997892457936451903530140172287n)
  .describe("bigint");
export const Int128Schema = z
  .bigint()
  .gte(-170141183460469231731687303715884105728n)
  .lte(170141183460469231731687303715884105727n)
  .describe("bigint");
export const Int136Schema = z
  .bigint()
  .gte(-43556142965880123323311949751266331066368n)
  .lte(43556142965880123323311949751266331066367n)
  .describe("bigint");
export const Int144Schema = z
  .bigint()
  .gte(-11150372599265311570767859136324180752990208n)
  .lte(11150372599265311570767859136324180752990208n)
  .describe("bigint");
export const Int152Schema = z
  .bigint()
  .gte(-2854495385411919762116571938898990272765493248n)
  .lte(2854495385411919762116571938898990272765493247n)
  .describe("bigint");
export const Int160Schema = z
  .bigint()
  .gte(-730750818665451459101842416358141509827966271488n)
  .lte(730750818665451459101842416358141509827966271487n)
  .describe("bigint");
export const Int168Schema = z
  .bigint()
  .gte(-187072209578355573530071658587684226515959365500928n)
  .lte(187072209578355573530071658587684226515959365500927n)
  .describe("bigint");
export const Int176Schema = z
  .bigint()
  .gte(-47890485652059026823698344598447161988085597568237568n)
  .lte(47890485652059026823698344598447161988085597568237567n)
  .describe("bigint");
export const Int184Schema = z
  .bigint()
  .gte(-12259964326927110866866776217202473468949912977468817408n)
  .lte(12259964326927110866866776217202473468949912977468817407n)
  .describe("bigint");
export const Int192Schema = z
  .bigint()
  .gte(-3138550867693340381917894711603833208051177722232017256448n)
  .lte(3138550867693340381917894711603833208051177722232017256447n)
  .describe("bigint");
export const Int200Schema = z
  .bigint()
  .gte(-803469022129495137770981046170581301261101496891396417650688n)
  .lte(803469022129495137770981046170581301261101496891396417650687n)
  .describe("bigint");
export const Int208Schema = z
  .bigint()
  .gte(-205688069665150755269371147819668813122841983204197482918576128n)
  .lte(205688069665150755269371147819668813122841983204197482918576128n)
  .describe("bigint");
export const Int216Schema = z
  .bigint()
  .gte(-52656145834278593348959013841835216159447547700274555627155488768n)
  .lte(52656145834278593348959013841835216159447547700274555627155488767n)
  .describe("bigint");
export const Int224Schema = z
  .bigint()
  .gte(-13479973333575319897333507543509815336818572211270286240551805124608n)
  .lte(13479973333575319897333507543509815336818572211270286240551805124607n)
  .describe("bigint");
export const Int232Schema = z
  .bigint()
  .gte(-3450873173395281893717377931138512726225554486085193277581262111899648n)
  .lte(3450873173395281893717377931138512726225554486085193277581262111899647n)
  .describe("bigint");
export const Int240Schema = z
  .bigint()
  .gte(
    -883423532389192164791648750371459257913741948437809479060803100646309888n
  )
  .lte(
    883423532389192164791648750371459257913741948437809479060803100646309887n
  )
  .describe("bigint");
export const Int248Schema = z
  .bigint()
  .gte(
    -226156424291633194186662080095093570025917938800079226639565593765455331328n
  )
  .lte(
    226156424291633194186662080095093570025917938800079226639565593765455331327n
  )
  .describe("bigint");
export const Int256Schema = z
  .bigint()
  .gte(
    -57896044618658097711785492504343953926634992332820282019728792003956564819968n
  )
  .lte(
    57896044618658097711785492504343953926634992332820282019728792003956564819967n
  )
  .describe("bigint");

export const AddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .describe("string");

export const BooleanSchema = z.boolean().describe("boolean");

export const StringSchema = z.string().describe("string");

export const Bytes1Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{2}$/)
  .describe("bigint");
export const Bytes2Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{4}$/)
  .describe("bigint");
export const Bytes3Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{6}$/)
  .describe("bigint");
export const Bytes4Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{8}$/)
  .describe("bigint");
export const Bytes5Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{10}$/)
  .describe("bigint");
export const Bytes6Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{12}$/)
  .describe("bigint");
export const Bytes7Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{14}$/)
  .describe("bigint");
export const Bytes8Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{16}$/)
  .describe("bigint");
export const Bytes9Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{18}$/)
  .describe("bigint");
export const Bytes10Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{20}$/)
  .describe("bigint");
export const Bytes11Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{22}$/)
  .describe("bigint");
export const Bytes12Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{24}$/)
  .describe("bigint");
export const Bytes13Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{26}$/)
  .describe("bigint");
export const Bytes14Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{28}$/)
  .describe("bigint");
export const Bytes15Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{30}$/)
  .describe("bigint");
export const Bytes16Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{32}$/)
  .describe("bigint");
export const Bytes17Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{34}$/)
  .describe("bigint");
export const Bytes18Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{36}$/)
  .describe("bigint");
export const Bytes19Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{38}$/)
  .describe("bigint");
export const Bytes20Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .describe("bigint");
export const Bytes21Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{42}$/)
  .describe("bigint");
export const Bytes22Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{44}$/)
  .describe("bigint");
export const Bytes23Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{46}$/)
  .describe("bigint");
export const Bytes24Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{48}$/)
  .describe("bigint");
export const Bytes25Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{50}$/)
  .describe("bigint");
export const Bytes26Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{52}$/)
  .describe("bigint");
export const Bytes27Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{54}$/)
  .describe("bigint");
export const Bytes28Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{56}$/)
  .describe("bigint");
export const Bytes29Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{58}$/)
  .describe("bigint");
export const Bytes30Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{60}$/)
  .describe("bigint");
export const Bytes31Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{62}$/)
  .describe("bigint");
export const Bytes32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/)
  .describe("bigint");

export const BytesSchema = z
  .string()
  .regex(/^0x([a-fA-F0-9][a-fA-F0-9])*$/)
  .describe("bigint");

export const typeToSchema: { [key: string]: ZodType } = {
  uint256: Uint256Schema,
  uint248: Uint248Schema,
  uint240: Uint240Schema,
  uint232: Uint232Schema,
  uint224: Uint224Schema,
  uint216: Uint216Schema,
  uint208: Uint208Schema,
  uint200: Uint200Schema,
  uint192: Uint192Schema,
  uint184: Uint184Schema,
  uint176: Uint176Schema,
  uint168: Uint168Schema,
  uint160: Uint160Schema,
  uint152: Uint152Schema,
  uint144: Uint144Schema,
  uint136: Uint136Schema,
  uint128: Uint128Schema,
  uint120: Uint120Schema,
  uint112: Uint112Schema,
  uint104: Uint104Schema,
  uint96: Uint96Schema,
  uint88: Uint88Schema,
  uint80: Uint80Schema,
  uint72: Uint72Schema,
  uint64: Uint64Schema,
  uint56: Uint56Schema,
  uint48: Uint48Schema,
  uint40: Uint40Schema,
  uint32: Uint32Schema,
  uint24: Uint24Schema,
  uint16: Uint16Schema,
  uint8: Uint8Schema,
  int256: Int256Schema,
  int248: Int248Schema,
  int240: Int240Schema,
  int232: Int232Schema,
  int224: Int224Schema,
  int216: Int216Schema,
  int208: Int208Schema,
  int200: Int200Schema,
  int192: Int192Schema,
  int184: Int184Schema,
  int176: Int176Schema,
  int168: Int168Schema,
  int160: Int160Schema,
  int152: Int152Schema,
  int144: Int144Schema,
  int136: Int136Schema,
  int128: Int128Schema,
  int120: Int120Schema,
  int112: Int112Schema,
  int104: Int104Schema,
  int96: Int96Schema,
  int88: Int88Schema,
  int80: Int80Schema,
  int72: Int72Schema,
  int64: Int64Schema,
  int56: Int56Schema,
  int48: Int48Schema,
  int40: Int40Schema,
  int32: Int32Schema,
  int24: Int24Schema,
  int16: Int16Schema,
  int8: Int8Schema,
  bytes1: Bytes1Schema,
  bytes2: Bytes2Schema,
  bytes3: Bytes3Schema,
  bytes4: Bytes4Schema,
  bytes5: Bytes5Schema,
  bytes6: Bytes6Schema,
  bytes7: Bytes7Schema,
  bytes8: Bytes8Schema,
  bytes9: Bytes9Schema,
  bytes10: Bytes10Schema,
  bytes11: Bytes11Schema,
  bytes12: Bytes12Schema,
  bytes13: Bytes13Schema,
  bytes14: Bytes14Schema,
  bytes15: Bytes15Schema,
  bytes16: Bytes16Schema,
  bytes17: Bytes17Schema,
  bytes18: Bytes18Schema,
  bytes19: Bytes19Schema,
  bytes20: Bytes20Schema,
  bytes21: Bytes21Schema,
  bytes22: Bytes22Schema,
  bytes23: Bytes23Schema,
  bytes24: Bytes24Schema,
  bytes25: Bytes25Schema,
  bytes26: Bytes26Schema,
  bytes27: Bytes27Schema,
  bytes28: Bytes28Schema,
  bytes29: Bytes29Schema,
  bytes30: Bytes30Schema,
  bytes31: Bytes31Schema,
  bytes32: Bytes32Schema,
  bytes: BytesSchema,
  address: AddressSchema,
  bool: BooleanSchema,
  string: StringSchema,
};

export const getSchema = (solidityType: string): ZodType => {
  const schema = typeToSchema[solidityType];
  if (schema === undefined) {
    return z.any();
  }

  return schema;
};

export const verify = (val: unknown, type: string): boolean => {
  const schema = typeToSchema[type];
  if (schema === undefined) {
    return true;
  }

  const res = schema.safeParse(val);
  return res.success as boolean;
};

export const solidityToTypescriptType = (
  type: string
): "number" | "bigint" | "string" | "boolean" | "unknown" => {
  const schema = typeToSchema[type];
  if (schema === undefined) {
    return "unknown";
  }

  const tsType = schema.description;
  if (
    tsType === "number" ||
    tsType == "bigint" ||
    tsType == "string" ||
    tsType == "boolean"
  ) {
    return tsType;
  } else {
    throw new Error("Unexpected error: typescript type of schema");
  }
};
