import { z } from "zod";
import type { ZodType } from "zod";
import type { ArgumentTsType } from "./types";

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

// Uint array
export const ArrayUint8Schema = z.array(Uint8Schema).describe("number[]");
export const ArrayUint16Schema = z.array(Uint16Schema).describe("number[]");
export const ArrayUint24Schema = z.array(Uint24Schema).describe("number[]");
export const ArrayUint32Schema = z.array(Uint32Schema).describe("number[]");
export const ArrayUint40Schema = z.array(Uint40Schema).describe("number[]");
export const ArrayUint48Schema = z.array(Uint48Schema).describe("number[]");
export const ArrayUint56Schema = z.array(Uint56Schema).describe("bigint[]");
export const ArrayUint64Schema = z.array(Uint64Schema).describe("bigint[]");
export const ArrayUint72Schema = z.array(Uint72Schema).describe("bigint[]");
export const ArrayUint80Schema = z.array(Uint80Schema).describe("bigint[]");
export const ArrayUint88Schema = z.array(Uint88Schema).describe("bigint[]");
export const ArrayUint96Schema = z.array(Uint96Schema).describe("bigint[]");
export const ArrayUint104Schema = z.array(Uint104Schema).describe("bigint[]");
export const ArrayUint112Schema = z.array(Uint112Schema).describe("bigint[]");
export const ArrayUint120Schema = z.array(Uint120Schema).describe("bigint[]");
export const ArrayUint128Schema = z.array(Uint128Schema).describe("bigint[]");
export const ArrayUint136Schema = z.array(Uint136Schema).describe("bigint[]");
export const ArrayUint144Schema = z.array(Uint144Schema).describe("bigint[]");
export const ArrayUint152Schema = z.array(Uint152Schema).describe("bigint[]");
export const ArrayUint160Schema = z.array(Uint160Schema).describe("bigint[]");
export const ArrayUint168Schema = z.array(Uint168Schema).describe("bigint[]");
export const ArrayUint176Schema = z.array(Uint176Schema).describe("bigint[]");
export const ArrayUint184Schema = z.array(Uint184Schema).describe("bigint[]");
export const ArrayUint192Schema = z.array(Uint192Schema).describe("bigint[]");
export const ArrayUint200Schema = z.array(Uint200Schema).describe("bigint[]");
export const ArrayUint208Schema = z.array(Uint208Schema).describe("bigint[]");
export const ArrayUint216Schema = z.array(Uint216Schema).describe("bigint[]");
export const ArrayUint224Schema = z.array(Uint224Schema).describe("bigint[]");
export const ArrayUint232Schema = z.array(Uint232Schema).describe("bigint[]");
export const ArrayUint240Schema = z.array(Uint240Schema).describe("bigint[]");
export const ArrayUint248Schema = z.array(Uint248Schema).describe("bigint[]");
export const ArrayUint256Schema = z.array(Uint256Schema).describe("bigint[]");

// Int array
export const ArrayInt8Schema = z.array(Int8Schema).describe("number[]");
export const ArrayInt16Schema = z.array(Int16Schema).describe("number[]");
export const ArrayInt24Schema = z.array(Int24Schema).describe("number[]");
export const ArrayInt32Schema = z.array(Int32Schema).describe("number[]");
export const ArrayInt40Schema = z.array(Int40Schema).describe("number[]");
export const ArrayInt48Schema = z.array(Int48Schema).describe("number[]");
export const ArrayInt56Schema = z.array(Int56Schema).describe("bigint[]");
export const ArrayInt64Schema = z.array(Int64Schema).describe("bigint[]");
export const ArrayInt72Schema = z.array(Int72Schema).describe("bigint[]");
export const ArrayInt80Schema = z.array(Int80Schema).describe("bigint[]");
export const ArrayInt88Schema = z.array(Int88Schema).describe("bigint[]");
export const ArrayInt96Schema = z.array(Int96Schema).describe("bigint[]");
export const ArrayInt104Schema = z.array(Int104Schema).describe("bigint[]");
export const ArrayInt112Schema = z.array(Int112Schema).describe("bigint[]");
export const ArrayInt120Schema = z.array(Int120Schema).describe("bigint[]");
export const ArrayInt128Schema = z.array(Int128Schema).describe("bigint[]");
export const ArrayInt136Schema = z.array(Int136Schema).describe("bigint[]");
export const ArrayInt144Schema = z.array(Int144Schema).describe("bigint[]");
export const ArrayInt152Schema = z.array(Int152Schema).describe("bigint[]");
export const ArrayInt160Schema = z.array(Int160Schema).describe("bigint[]");
export const ArrayInt168Schema = z.array(Int168Schema).describe("bigint[]");
export const ArrayInt176Schema = z.array(Int176Schema).describe("bigint[]");
export const ArrayInt184Schema = z.array(Int184Schema).describe("bigint[]");
export const ArrayInt192Schema = z.array(Int192Schema).describe("bigint[]");
export const ArrayInt200Schema = z.array(Int200Schema).describe("bigint[]");
export const ArrayInt208Schema = z.array(Int208Schema).describe("bigint[]");
export const ArrayInt216Schema = z.array(Int216Schema).describe("bigint[]");
export const ArrayInt224Schema = z.array(Int224Schema).describe("bigint[]");
export const ArrayInt232Schema = z.array(Int232Schema).describe("bigint[]");
export const ArrayInt240Schema = z.array(Int240Schema).describe("bigint[]");
export const ArrayInt248Schema = z.array(Int248Schema).describe("bigint[]");
export const ArrayInt256Schema = z.array(Int256Schema).describe("bigint[]");

// Bytes Array
export const ArrayBytes1Schema = z.array(Bytes1Schema).describe("string[]");
export const ArrayBytes2Schema = z.array(Bytes2Schema).describe("string[]");
export const ArrayBytes3Schema = z.array(Bytes3Schema).describe("string[]");
export const ArrayBytes4Schema = z.array(Bytes4Schema).describe("string[]");
export const ArrayBytes5Schema = z.array(Bytes5Schema).describe("string[]");
export const ArrayBytes6Schema = z.array(Bytes6Schema).describe("string[]");
export const ArrayBytes7Schema = z.array(Bytes7Schema).describe("string[]");
export const ArrayBytes8Schema = z.array(Bytes8Schema).describe("string[]");
export const ArrayBytes9Schema = z.array(Bytes9Schema).describe("string[]");
export const ArrayBytes10Schema = z.array(Bytes10Schema).describe("string[]");
export const ArrayBytes11Schema = z.array(Bytes11Schema).describe("string[]");
export const ArrayBytes12Schema = z.array(Bytes12Schema).describe("string[]");
export const ArrayBytes13Schema = z.array(Bytes13Schema).describe("string[]");
export const ArrayBytes14Schema = z.array(Bytes14Schema).describe("string[]");
export const ArrayBytes15Schema = z.array(Bytes15Schema).describe("string[]");
export const ArrayBytes16Schema = z.array(Bytes16Schema).describe("string[]");
export const ArrayBytes17Schema = z.array(Bytes17Schema).describe("string[]");
export const ArrayBytes18Schema = z.array(Bytes18Schema).describe("string[]");
export const ArrayBytes19Schema = z.array(Bytes19Schema).describe("string[]");
export const ArrayBytes20Schema = z.array(Bytes20Schema).describe("string[]");
export const ArrayBytes21Schema = z.array(Bytes21Schema).describe("string[]");
export const ArrayBytes22Schema = z.array(Bytes22Schema).describe("string[]");
export const ArrayBytes23Schema = z.array(Bytes23Schema).describe("string[]");
export const ArrayBytes24Schema = z.array(Bytes24Schema).describe("string[]");
export const ArrayBytes25Schema = z.array(Bytes25Schema).describe("string[]");
export const ArrayBytes26Schema = z.array(Bytes26Schema).describe("string[]");
export const ArrayBytes27Schema = z.array(Bytes27Schema).describe("string[]");
export const ArrayBytes28Schema = z.array(Bytes28Schema).describe("string[]");
export const ArrayBytes29Schema = z.array(Bytes29Schema).describe("string[]");
export const ArrayBytes30Schema = z.array(Bytes30Schema).describe("string[]");
export const ArrayBytes31Schema = z.array(Bytes31Schema).describe("string[]");
export const ArrayBytes32Schema = z.array(Bytes32Schema).describe("string[]");
export const ArrayBytesSchema = z.array(BytesSchema).describe("string[]");

// String array
export const ArrayStringSchema = z.array(StringSchema).describe("string[]");

// Boolean array
export const ArrayBooleanSchema = z.array(BooleanSchema).describe("boolean[]");

// Address array
export const ArrayAddressSchema = z.array(AddressSchema).describe("string[]");

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
  "uint256[]": ArrayUint256Schema,
  "uint248[]": ArrayUint248Schema,
  "uint240[]": ArrayUint240Schema,
  "uint232[]": ArrayUint232Schema,
  "uint224[]": ArrayUint224Schema,
  "uint216[]": ArrayUint216Schema,
  "uint208[]": ArrayUint208Schema,
  "uint200[]": ArrayUint200Schema,
  "uint192[]": ArrayUint192Schema,
  "uint184[]": ArrayUint184Schema,
  "uint176[]": ArrayUint176Schema,
  "uint168[]": ArrayUint168Schema,
  "uint160[]": ArrayUint160Schema,
  "uint152[]": ArrayUint152Schema,
  "uint144[]": ArrayUint144Schema,
  "uint136[]": ArrayUint136Schema,
  "uint128[]": ArrayUint128Schema,
  "uint120[]": ArrayUint120Schema,
  "uint112[]": ArrayUint112Schema,
  "uint104[]": ArrayUint104Schema,
  "uint96[]": ArrayUint96Schema,
  "uint88[]": ArrayUint88Schema,
  "uint80[]": ArrayUint80Schema,
  "uint72[]": ArrayUint72Schema,
  "uint64[]": ArrayUint64Schema,
  "uint56[]": ArrayUint56Schema,
  "uint48[]": ArrayUint48Schema,
  "uint40[]": ArrayUint40Schema,
  "uint32[]": ArrayUint32Schema,
  "uint24[]": ArrayUint24Schema,
  "uint16[]": ArrayUint16Schema,
  "uint8[]": ArrayUint8Schema,
  "int256[]": ArrayInt256Schema,
  "int248[]": ArrayInt248Schema,
  "int240[]": ArrayInt240Schema,
  "int232[]": ArrayInt232Schema,
  "int224[]": ArrayInt224Schema,
  "int216[]": ArrayInt216Schema,
  "int208[]": ArrayInt208Schema,
  "int200[]": ArrayInt200Schema,
  "int192[]": ArrayInt192Schema,
  "int184[]": ArrayInt184Schema,
  "int176[]": ArrayInt176Schema,
  "int168[]": ArrayInt168Schema,
  "int160[]": ArrayInt160Schema,
  "int152[]": ArrayInt152Schema,
  "int144[]": ArrayInt144Schema,
  "int136[]": ArrayInt136Schema,
  "int128[]": ArrayInt128Schema,
  "int120[]": ArrayInt120Schema,
  "int112[]": ArrayInt112Schema,
  "int104[]": ArrayInt104Schema,
  "int96[]": ArrayInt96Schema,
  "int88[]": ArrayInt88Schema,
  "int80[]": ArrayInt80Schema,
  "int72[]": ArrayInt72Schema,
  "int64[]": ArrayInt64Schema,
  "int56[]": ArrayInt56Schema,
  "int48[]": ArrayInt48Schema,
  "int40[]": ArrayInt40Schema,
  "int32[]": ArrayInt32Schema,
  "int24[]": ArrayInt24Schema,
  "int16[]": ArrayInt16Schema,
  "int8[]": ArrayInt8Schema,
  "bytes1[]": ArrayBytes1Schema,
  "bytes2[]": ArrayBytes2Schema,
  "bytes3[]": ArrayBytes3Schema,
  "bytes4[]": ArrayBytes4Schema,
  "bytes5[]": ArrayBytes5Schema,
  "bytes6[]": ArrayBytes6Schema,
  "bytes7[]": ArrayBytes7Schema,
  "bytes8[]": ArrayBytes8Schema,
  "bytes9[]": ArrayBytes9Schema,
  "bytes10[]": ArrayBytes10Schema,
  "bytes11[]": ArrayBytes11Schema,
  "bytes12[]": ArrayBytes12Schema,
  "bytes13[]": ArrayBytes13Schema,
  "bytes14[]": ArrayBytes14Schema,
  "bytes15[]": ArrayBytes15Schema,
  "bytes16[]": ArrayBytes16Schema,
  "bytes17[]": ArrayBytes17Schema,
  "bytes18[]": ArrayBytes18Schema,
  "bytes19[]": ArrayBytes19Schema,
  "bytes20[]": ArrayBytes20Schema,
  "bytes21[]": ArrayBytes21Schema,
  "bytes22[]": ArrayBytes22Schema,
  "bytes23[]": ArrayBytes23Schema,
  "bytes24[]": ArrayBytes24Schema,
  "bytes25[]": ArrayBytes25Schema,
  "bytes26[]": ArrayBytes26Schema,
  "bytes27[]": ArrayBytes27Schema,
  "bytes28[]": ArrayBytes28Schema,
  "bytes29[]": ArrayBytes29Schema,
  "bytes30[]": ArrayBytes30Schema,
  "bytes31[]": ArrayBytes31Schema,
  "bytes32[]": ArrayBytes32Schema,
  "bytes[]": ArrayBytesSchema,
  "address[]": ArrayAddressSchema,
  "bool[]": ArrayBooleanSchema,
  "string[]": ArrayStringSchema,
};

/**
 * Get the Zod schema for a Solidity type.
 *
 * @param solidityType - A string matching the name of a Solidity type.
 * @returns A Zod schema for the provided Solidity type.
 */
export const getSchema = (solidityType: string): ZodType => {
  const schema = typeToSchema[solidityType];
  if (schema === undefined) {
    return z.any();
  }

  return schema;
};

/**
 * Verify a given value according to its matching Solidity type.
 *
 * @param val - The value to be verified.
 * @param type - The Solidity type for the verification.
 * @returns True if the value is verified for the given type, false otherwise.
 */
export const verify = (val: unknown, type: string): boolean => {
  const schema = typeToSchema[type];
  if (schema === undefined) {
    return true;
  }

  const res = schema.safeParse(val);
  return res.success as boolean;
};

/**
 * Get the Typescript type which is compatible with an expected Solidity type.
 *
 * @param type - The Solidity type for for which the compatible Typedcript type should be returned.
 * @returns A string matching the compatible Typescript type for the provided Solidity type.
 */
export const solidityToTypescriptType = (type: string): ArgumentTsType => {
  const schema = typeToSchema[type];
  if (schema === undefined) {
    return "unknown";
  }

  const tsType = schema.description;
  if (
    tsType === "number" ||
    tsType === "bigint" ||
    tsType === "string" ||
    tsType === "boolean" ||
    tsType === "number[]" ||
    tsType === "bigint[]" ||
    tsType === "string[]" ||
    tsType === "boolean[]"
  ) {
    return tsType;
  } else {
    throw new Error("Unexpected error: typescript type of schema");
  }
};
