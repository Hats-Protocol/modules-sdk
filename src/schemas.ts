import { z } from "zod";

// Uint
export const Uint8Schema = z.number().int().nonnegative().lte(255);
export const Uint16Schema = z.number().int().nonnegative().lte(65535);
export const Uint24Schema = z.number().int().nonnegative().lte(16777215);
export const Uint32Schema = z.number().int().nonnegative().lte(4294967295);
export const Uint40Schema = z.number().int().nonnegative().lte(1099511627775);
export const Uint48Schema = z.number().int().nonnegative().lte(281474976710655);
export const Uint56Schema = z.bigint().nonnegative().lte(72057594037927935n);
export const Uint64Schema = z.bigint().nonnegative().lte(18446744073709551615n);
export const Uint72Schema = z
  .bigint()
  .nonnegative()
  .lte(4722366482869645213695n);
export const Uint80Schema = z
  .bigint()
  .nonnegative()
  .lte(1208925819614629174706175n);
export const Uint88Schema = z
  .bigint()
  .nonnegative()
  .lte(309485009821345068724781055n);
export const Uint96Schema = z
  .bigint()
  .nonnegative()
  .lte(79228162514264337593543950335n);
export const Uint104Schema = z
  .bigint()
  .nonnegative()
  .lte(20282409603651670423947251286015n);
export const Uint112Schema = z
  .bigint()
  .nonnegative()
  .lte(5192296858534827628530496329220095n);
export const Uint120Schema = z
  .bigint()
  .nonnegative()
  .lte(1329227995784915872903807060280344575n);
export const Uint128Schema = z
  .bigint()
  .nonnegative()
  .lte(340282366920938463463374607431768211455n);
export const Uint136Schema = z
  .bigint()
  .nonnegative()
  .lte(87112285931760246646623899502532662132735n);
export const Uint144Schema = z
  .bigint()
  .nonnegative()
  .lte(22300745198530623141535718272648361505980415n);
export const Uint152Schema = z
  .bigint()
  .nonnegative()
  .lte(5708990770823839524233143877797980545530986495n);
export const Uint160Schema = z
  .bigint()
  .nonnegative()
  .lte(1461501637330902918203684832716283019655932542975n);
export const Uint168Schema = z
  .bigint()
  .nonnegative()
  .lte(374144419156711147060143317175368453031918731001855n);
export const Uint176Schema = z
  .bigint()
  .nonnegative()
  .lte(95780971304118053647396689196894323976171195136475135n);
export const Uint184Schema = z
  .bigint()
  .nonnegative()
  .lte(24519928653854221733733552434404946937899825954937634815n);
export const Uint192Schema = z
  .bigint()
  .nonnegative()
  .lte(6277101735386680763835789423207666416102355444464034512895n);
export const Uint200Schema = z
  .bigint()
  .nonnegative()
  .lte(1606938044258990275541962092341162602522202993782792835301375n);
export const Uint208Schema = z
  .bigint()
  .nonnegative()
  .lte(411376139330301510538742295639337626245683966408394965837152255n);
export const Uint216Schema = z
  .bigint()
  .nonnegative()
  .lte(105312291668557186697918027683670432318895095400549111254310977535n);
export const Uint224Schema = z
  .bigint()
  .nonnegative()
  .lte(26959946667150639794667015087019630673637144422540572481103610249215n);
export const Uint232Schema = z
  .bigint()
  .nonnegative()
  .lte(6901746346790563787434755862277025452451108972170386555162524223799295n);
export const Uint240Schema = z.bigint().nonnegative().lte(
  // eslint-disable-next-line prettier/prettier
  1766847064778384329583297500742918515827483896875618958121606201292619775n
);
export const Uint248Schema = z.bigint().nonnegative().lte(
  // eslint-disable-next-line prettier/prettier
  452312848583266388373324160190187140051835877600158453279131187530910662655n
);
export const Uint256Schema = z.bigint().nonnegative().lte(
  // eslint-disable-next-line prettier/prettier
  115792089237316195423570985008687907853269984665640564039457584007913129639935n
);

// Int
export const Int8Schema = z.number().int().gte(-128).lte(127);
export const Int16Schema = z.number().int().gte(-32768).lte(32767);
export const Int24Schema = z.number().int().gte(-8388608).lte(8388607);
export const Int32Schema = z.number().int().gte(-2147483648).lte(2147483647);
export const Int40Schema = z
  .number()
  .int()
  .gte(-549755813888)
  .lte(549755813887);
export const Int48Schema = z
  .number()
  .int()
  .gte(-140737488355328)
  .lte(140737488355327);
export const Int56Schema = z
  .bigint()
  .gte(-36028797018963968n)
  .lte(36028797018963967n);
export const Int64Schema = z
  .bigint()
  .gte(-9223372036854775808n)
  .lte(9223372036854775807n);
export const Int72Schema = z
  .bigint()
  .gte(-2361183241434822606848n)
  .lte(2361183241434822606847n);
export const Int80Schema = z
  .bigint()
  .gte(-604462909807314587353088n)
  .lte(604462909807314587353088n);
export const Int88Schema = z
  .bigint()
  .gte(-154742504910672534362390528n)
  .lte(154742504910672534362390527n);
export const Int96Schema = z
  .bigint()
  .gte(-39614081257132168796771975168n)
  .lte(39614081257132168796771975168n);
export const Int104Schema = z
  .bigint()
  .gte(-10141204801825835211973625643008n)
  .lte(10141204801825835211973625643007n);
export const Int112Schema = z
  .bigint()
  .gte(-2596148429267413814265248164610048n)
  .lte(2596148429267413814265248164610047n);
export const Int120Schema = z
  .bigint()
  .gte(-664613997892457936451903530140172288n)
  .lte(664613997892457936451903530140172287n);
export const Int128Schema = z
  .bigint()
  .gte(-170141183460469231731687303715884105728n)
  .lte(170141183460469231731687303715884105727n);
export const Int136Schema = z
  .bigint()
  .gte(-43556142965880123323311949751266331066368n)
  .lte(43556142965880123323311949751266331066367n);
export const Int144Schema = z
  .bigint()
  .gte(-11150372599265311570767859136324180752990208n)
  .lte(11150372599265311570767859136324180752990208n);
export const Int152Schema = z
  .bigint()
  .gte(-2854495385411919762116571938898990272765493248n)
  .lte(2854495385411919762116571938898990272765493247n);
export const Int160Schema = z
  .bigint()
  .gte(-730750818665451459101842416358141509827966271488n)
  .lte(730750818665451459101842416358141509827966271487n);
export const Int168Schema = z
  .bigint()
  .gte(-187072209578355573530071658587684226515959365500928n)
  .lte(187072209578355573530071658587684226515959365500927n);
export const Int176Schema = z
  .bigint()
  .gte(-47890485652059026823698344598447161988085597568237568n)
  .lte(47890485652059026823698344598447161988085597568237567n);
export const Int184Schema = z
  .bigint()
  .gte(-12259964326927110866866776217202473468949912977468817408n)
  .lte(12259964326927110866866776217202473468949912977468817407n);
export const Int192Schema = z
  .bigint()
  .gte(-3138550867693340381917894711603833208051177722232017256448n)
  .lte(3138550867693340381917894711603833208051177722232017256447n);
export const Int200Schema = z
  .bigint()
  .gte(-803469022129495137770981046170581301261101496891396417650688n)
  .lte(803469022129495137770981046170581301261101496891396417650687n);
export const Int208Schema = z
  .bigint()
  .gte(-205688069665150755269371147819668813122841983204197482918576128n)
  .lte(205688069665150755269371147819668813122841983204197482918576128n);
export const Int216Schema = z
  .bigint()
  .gte(-52656145834278593348959013841835216159447547700274555627155488768n)
  .lte(52656145834278593348959013841835216159447547700274555627155488767n);
export const Int224Schema = z
  .bigint()
  .gte(-13479973333575319897333507543509815336818572211270286240551805124608n)
  .lte(13479973333575319897333507543509815336818572211270286240551805124607n);
export const Int232Schema = z
  .bigint()
  .gte(-3450873173395281893717377931138512726225554486085193277581262111899648n)
  .lte(3450873173395281893717377931138512726225554486085193277581262111899647n);
export const Int240Schema = z
  .bigint()
  .gte(
    // eslint-disable-next-line prettier/prettier
    -883423532389192164791648750371459257913741948437809479060803100646309888n
  )
  .lte(
    // eslint-disable-next-line prettier/prettier
    883423532389192164791648750371459257913741948437809479060803100646309887n
  );
export const Int248Schema = z
  .bigint()
  .gte(
    // eslint-disable-next-line prettier/prettier
    -226156424291633194186662080095093570025917938800079226639565593765455331328n
  )
  .lte(
    // eslint-disable-next-line prettier/prettier
    226156424291633194186662080095093570025917938800079226639565593765455331327n
  );
export const Int256Schema = z
  .bigint()
  .gte(
    // eslint-disable-next-line prettier/prettier
    -57896044618658097711785492504343953926634992332820282019728792003956564819968n
  )
  .lte(
    // eslint-disable-next-line prettier/prettier
    57896044618658097711785492504343953926634992332820282019728792003956564819967n
  );

export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const BooleanSchema = z.boolean();

export const StringSchema = z.string();

export const verify = (val: unknown, type: string): boolean => {
  switch (type) {
    case "uint256": {
      const res = Uint256Schema.safeParse(val);
      if (!res.success) {
        return false;
      }
      break;
    }
    case "address": {
      const res = AddressSchema.safeParse(val);
      if (!res.success) {
        return false;
      }
      break;
    }
  }

  return true;
};
