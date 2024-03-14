import { BaseError, ContractFunctionRevertedError } from "viem";

export class ChainIdMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChainIdMismatchError";
  }
}

export class MissingPublicClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingPublicClientError";
  }
}

export class MissingWalletClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingWalletClientError";
  }
}

export class MissingWalletClientChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingWalletClientChainError";
  }
}

export class MissingPublicClientChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingPublicClientChainError";
  }
}

export class TransactionRevertedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionRevertedError";
  }
}

export class ModuleNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleNotAvailableError";
  }
}

export class InvalidParamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidParamError";
  }
}

export class ClientNotPreparedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientNotPreparedError";
  }
}

export class ParametersLengthsMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParametersLengthsMismatchError";
  }
}

export class ModulesRegistryFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModulesRegistryFetchError";
  }
}

export class ModuleParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleParameterError";
  }
}

export class ModuleFunctionRevertedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModuleFunctionRevertedError";
  }
}

// AllowList Eligibility Errors
export class AllowlistEligibility_NotOwnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_NotOwnerError";
  }
}

export class AllowlistEligibility_NotArbitratorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_NotArbitratorError";
  }
}

export class AllowlistEligibility_ArrayLengthMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_ArrayLengthMismatchError";
  }
}

export class AllowlistEligibility_NotWearerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AllowlistEligibility_NotWearerError";
  }
}

// HatsElection Eligibility Errors
export class HatsElectionEligibility_NotBallotBoxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_NotBallotBoxError";
  }
}

export class HatsElectionEligibility_NotAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_NotAdminError";
  }
}

export class HatsElectionEligibility_TooManyWinnersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_TooManyWinnersError";
  }
}

export class HatsElectionEligibility_ElectionClosedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_ElectionClosedError";
  }
}

export class HatsElectionEligibility_InvalidTermEndError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_InvalidTermEndError";
  }
}

export class HatsElectionEligibility_TermNotEndedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_TermNotEndedError";
  }
}

export class HatsElectionEligibility_NextTermNotReadyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HatsElectionEligibility_NextTermNotReadyError";
  }
}

// JokeRace Eligibility Errors
export class JokeraceEligibility_ContestNotCompletedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JokeraceEligibility_ContestNotCompletedError";
  }
}
export class JokeraceEligibility_TermNotCompletedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JokeraceEligibility_TermNotCompletedError";
  }
}

export class JokeraceEligibility_NotAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JokeraceEligibility_NotAdminError";
  }
}

export class JokeraceEligibility_MustHaveDownvotingDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JokeraceEligibility_MustHaveDownvotingDisabledError";
  }
}

export class JokeraceEligibility_MustHaveSortingEnabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JokeraceEligibility_MustHaveSortingEnabledError";
  }
}

// Passthrough Eligibility Errors
export class PassthroughEligibility_NotAuthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PassthroughEligibility_NotAuthorizedError";
  }
}

// Season Toggle Errors
export class SeasonToggle_NotBranchAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeasonToggle_NotBranchAdminError";
  }
}

export class SeasonToggle_NotExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeasonToggle_NotExtendableError";
  }
}

export class SeasonToggle_InvalidExtensionDelayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeasonToggle_InvalidExtensionDelay";
  }
}

export class SeasonToggle_SeasonDurationTooShortError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeasonToggle_SeasonDurationTooShort";
  }
}

// Staking Eligibility Errors
export class StakingEligibility_InsufficientStakeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_InsufficientStakeError";
  }
}

export class StakingEligibility_CooldownNotEndedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_CooldownNotEndedError";
  }
}

export class StakingEligibility_NoCooldownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_NoCooldownError";
  }
}

export class StakingEligibility_AlreadySlashedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_AlreadySlashedError";
  }
}

export class StakingEligibility_NotJudgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_NotJudgeError";
  }
}

export class StakingEligibility_NotRecipientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_NotRecipientError";
  }
}

export class StakingEligibility_NotHatAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_NotHatAdminError";
  }
}

export class StakingEligibility_HatImmutableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_HatImmutableError";
  }
}

export class StakingEligibility_TransferFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_TransferFailedError";
  }
}

export class StakingEligibility_NothingToWithdrawError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_NothingToWithdrawError";
  }
}

export class StakingEligibility_NotSlashedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StakingEligibility_NotSlashedError";
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export function getModuleFunctionError(err: unknown, moduleId: string): never {
  if (err instanceof BaseError) {
    const revertError = err.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";

      // AllowList Eligibility error
      if (moduleId === "0xaC208e6668DE569C6ea1db76DeCea70430335Ed5") {
        switch (errorName) {
          case "AllowlistEligibility_NotOwner": {
            throw new AllowlistEligibility_NotOwnerError(
              `Error: the caller does not wear the module's Owner Hat`
            );
          }
          case "AllowlistEligibility_NotArbitrator": {
            throw new AllowlistEligibility_NotArbitratorError(
              `Error: the caller does not wear the module's Arbitrator Hat`
            );
          }
          case "AllowlistEligibility_ArrayLengthMismatch": {
            throw new AllowlistEligibility_NotArbitratorError(
              `Error: array arguments are not of the same length`
            );
          }
          case "AllowlistEligibility_NotWearer": {
            throw new AllowlistEligibility_NotWearerError(
              `Error: Attempting to burn a hat that an account is not wearing`
            );
          }
          default: {
            throw err;
          }
        }
      }

      // Hat Elections Eligibility error
      if (moduleId === "0xd3b916a8F0C4f9D1d5B6Af29c3C012dbd4f3149E") {
        switch (errorName) {
          case "NotBallotBox": {
            throw new HatsElectionEligibility_NotBallotBoxError(
              `Error: the caller does not wear the module's Ballot Box Hat`
            );
          }
          case "NotAdmin": {
            throw new HatsElectionEligibility_NotAdminError(
              `Error: the caller does not wear the module's Admin Hat`
            );
          }
          case "TooManyWinners": {
            throw new HatsElectionEligibility_TooManyWinnersError(
              `Error: amount of election winners is larger than the hat's max amount of wearers`
            );
          }
          case "ElectionClosed": {
            throw new HatsElectionEligibility_ElectionClosedError(
              `Error: attempting to submit results for a closed election`
            );
          }
          case "InvalidTermEnd": {
            throw new HatsElectionEligibility_InvalidTermEndError(
              `Error: the next term's end time must be larger than the current one`
            );
          }
          case "TermNotEnded": {
            throw new HatsElectionEligibility_TermNotEndedError(
              `Error: attempting to start the next term while the current one has not ended`
            );
          }
          case "NextTermNotReady": {
            throw new HatsElectionEligibility_NextTermNotReadyError(
              `Error: next term must be set and its election must be closed`
            );
          }
          default: {
            throw err;
          }
        }
      }

      // JokeRace Eligibility error
      if (moduleId === "0xAE0e56A0c509dA713722c1aFFcF4B5f1C6CDc73a") {
        switch (errorName) {
          case "JokeraceEligibility_ContestNotCompleted": {
            throw new JokeraceEligibility_ContestNotCompletedError(
              `Error: the JokeRace contest has not completed yet`
            );
          }
          case "JokeraceEligibility_TermNotCompleted": {
            throw new JokeraceEligibility_TermNotCompletedError(
              `Error: can only set a new election once the current term has ended`
            );
          }
          case "JokeraceEligibility_NotAdmin": {
            throw new JokeraceEligibility_NotAdminError(
              `Error: caller does not wear the module's Admin Hat`
            );
          }
          case "JokeraceEligibility_MustHaveDownvotingDisabled": {
            throw new JokeraceEligibility_MustHaveDownvotingDisabledError(
              `Error: only JokeRace contests with down-voting disabled are supported`
            );
          }
          case "JokeraceEligibility_MustHaveSortingEnabled": {
            throw new JokeraceEligibility_MustHaveSortingEnabledError(
              `Error: only JokeRace contests with sorting enabled are supported`
            );
          }
          default: {
            throw err;
          }
        }
      }

      // Passthrough Eligibility error
      if (moduleId === "0x050079a8fbFCE76818C62481BA015b89567D2d35") {
        switch (errorName) {
          case "NotAuthorized": {
            throw new PassthroughEligibility_NotAuthorizedError(
              `Error: caller is not wearing the eligibility/toggle passthrough hat`
            );
          }
          default: {
            throw err;
          }
        }
      }

      // Season Toggle error
      if (moduleId === "0xFb6bD2e96B123d0854064823f6cb59420A285C00") {
        switch (errorName) {
          case "SeasonToggle_NotBranchAdmin": {
            throw new SeasonToggle_NotBranchAdminError(
              `Error: caller is not an admin of the season toggle branch`
            );
          }
          case "SeasonToggle_NotExtendable": {
            throw new SeasonToggle_NotExtendableError(
              `Error: attempting to extend a branch to a new season before its extendable`
            );
          }
          case "SeasonToggle_InvalidExtensionDelay": {
            throw new SeasonToggle_InvalidExtensionDelayError(
              `Error: valid extension delays are smaller than 10,000`
            );
          }
          case "SeasonToggle_SeasonDurationTooShort": {
            throw new SeasonToggle_SeasonDurationTooShortError(
              `Error: season durations must be at least one hour long`
            );
          }
          default: {
            throw err;
          }
        }
      }

      // Staking Eligibility error
      if (moduleId === "0x9E01030aF633Be5a439DF122F2eEf750b44B8aC7") {
        switch (errorName) {
          case "StakingEligibility_InsufficientStake": {
            throw new StakingEligibility_InsufficientStakeError(
              `Error: attempting to unstake more than staker has staked`
            );
          }
          case "StakingEligibility_CooldownNotEnded": {
            throw new StakingEligibility_CooldownNotEndedError(
              `Error: attempting to complete an unstake before the cooldown period has elapsed`
            );
          }
          case "StakingEligibility_NoCooldownEnded": {
            throw new StakingEligibility_NoCooldownError(
              `Error: attempting to complete an unstake before beginning a cooldown period`
            );
          }
          case "StakingEligibility_AlreadySlashed": {
            throw new StakingEligibility_AlreadySlashedError(
              `Error: attempting to slash an already-slashed wearer, or a slashed staker tries to unstake`
            );
          }
          case "StakingEligibility_NotJudge": {
            throw new StakingEligibility_NotJudgeError(
              `Error: caller is not wearing the Judge Hat`
            );
          }
          case "StakingEligibility_NotRecipient": {
            throw new StakingEligibility_NotRecipientError(
              `Error: caller is not wearing the Recipient Hat`
            );
          }
          case "StakingEligibility_NotHatAdmin": {
            throw new StakingEligibility_NotHatAdminError(
              `Error: caller is not the hat's admin`
            );
          }
          case "StakingEligibility_HatImmutable": {
            throw new StakingEligibility_HatImmutableError(
              `Error: a change to the minStake is attempted on an immutable hat`
            );
          }
          case "StakingEligibility_TransferFailed": {
            throw new StakingEligibility_TransferFailedError(
              `Error: staking token transfer has failed`
            );
          }
          case "StakingEligibility_NothingToWithdraw": {
            throw new StakingEligibility_NothingToWithdrawError(
              `Error: nothing to withdraw`
            );
          }
          case "StakingEligibility_NotSlashed": {
            throw new StakingEligibility_NotSlashedError(
              `Error: attempting to forgive an unslashed staker`
            );
          }
          default: {
            throw err;
          }
        }
      }

      // Error from an unknown module
      throw new ModuleFunctionRevertedError(
        `Error: module function reverted with error name ${errorName}`
      );
    }
  } else {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("Unexpected error occured");
    }
  }
}
