import TosEn from './tos/en'
import PPEn from './privacyPolicy/en'

export default {
  'common': {
    'next': 'Next',
    'skip': 'Skip',
    'finish': 'Finish',
    'confirm': 'Confirm',
    'continue': 'Continue',
    'save': 'Save',
    'gotIt': 'Got it',
    'search': 'Search',
    'deselectAll': 'Deselect All',
    'selectAll': 'Select All',
    'cancel': 'Cancel',
    'unknownError': 'Unknown Error',
    'unexpectedServerResponse': 'Unexpected Server Response',
    'networkErrors': {
      'errNetwork':
        'A network error has occurred. Are you connected to the internet?',
      'errCanceled': 'Request was canceled',
      'etimedout': 'Request timed out',
      'econnaborted': 'Connection aborted',
    },
    'submit': 'Submit',
    'cryptoError': 'Unexpected cryptography error',
    'secondsShort': 's',
    'ok': 'ok',
    'request': 'Request',
    'back': 'Back',
    'goBack': 'Go back',
    'close': 'Close',
    'done': 'Done',
    'errorCreatingInbox': 'Error creating user inbox.',
    'accept': 'Accept',
    'decline': 'Decline',
    'youSure': 'Are you sure?',
    'nope': 'Nope',
    'yesDelete': 'Yes, delete',
    'more': 'More',
    'yes': 'Yes',
    'no': 'No',
    'czk': 'CZK',
    'usd': 'USD',
    'eur': 'EUR',
    'myOffers': 'My offers',
    'errorOpeningLink': {
      'message': 'Error opening link',
      'text': 'Copy to clipboard instead?',
      'copy': 'Copy and close',
    },
    'nice': 'Nice',
    'success': 'Success!',
    'requested': 'Requested',
    'now': 'Now',
    'declined': 'Declined',
    'eurSymbol': '€',
    'dollarSymbol': '$',
    'czkSymbol': 'Kč',
    'reset': 'Reset',
  },
  'loginFlow': {
    'anonymityNotice': 'Nobody will see this until you allow it. Not even us.',
    'intro': {
      'title1': 'Import your contacts anonymously.',
      'title2': 'See their buy & sell offers.',
      'title3': 'Request identity for the ones you like and trade.',
    },
    'start': {
      'subtitle': 'Welcome! Ready to get started?',
      'touLabel': 'I agree to',
      'termsOfUse': 'Terms of use',
    },
    'anonymizationNotice': {
      'title': 'Your identity will be anonymized.',
      'text':
        'Nobody will see your real name and profile picture until you reveal it for particular trade. Not even us. Let’s set up your true identity first.',
    },
    'name': {
      'prompt': 'What do your friends call you?',
      'placeholder': 'Name or nickname',
      'nameValidationError':
        'Name should be at least 1 characters long and maximum 50 characters long',
    },
    'photo': {
      'title': 'Hey {{name}}! What do you look like?',
      'selectSource': 'Select the source of your image',
      'camera': 'Camera',
      'gallery': 'Gallery',
      'permissionsNotGranted': 'Permissions not granted.',
      'nothingSelected': 'No image was selected',
    },
    'anonymization': {
      'beforeTitle': 'This is your private profile',
      'afterTitle': 'Identity anonymized!',
      'action': 'Anonymize',
      'afterDescription':
        'This is how other users will see you until you reveal your real identity.',
    },
    'phoneNumber': {
      'title': 'What’s your phone number?',
      'placeholder': 'Phone number',
      'text':
        'In order to connect you with the Vexl community, enter your phone number',
      'errors': {
        'invalidPhoneNumber': 'Invalid phone number. Please try again.',
        'previousCodeNotExpired':
          'Verification for this phone number is already in progress. Please wait until it expires',
      },
    },
    'verificationCode': {
      'title': 'We just sent you the verification code',
      'text': 'Enter it bellow to verify',
      'inputPlaceholder': 'Your verification code',
      'retryCountdown': 'Didn’t receive a code? Resend in',
      'retry': 'Didn’t receive a code? Tap to resend',
      'errors': {
        'userAlreadyExists': 'User with this phone number already exists',
        'challengeCouldNotBeGenerated':
          'Challenge could not be generated. Try again later',
        'verificationNotFound': 'Verification code wrong.',
        'UserNotFound': 'User not found. Try to resend the code.',
        'SignatureCouldNotBeGenerated':
          'Signature could not be generated. Try again later',
        'PublicKeyOrHashInvalid': 'Public key or hash invalid. Try again later',
      },
      'success': {
        'title': 'Phone number verified.\nLet’s setup your profile.',
        'errorWhileParsingSessionForInternalState': 'Error while saving user',
      },
    },
    'importContacts': {
      'title': 'Now, let’s find your friends!',
      'text':
        'Vexl is using your real-world social network - your friends and their friends. The more contacts you add, the more offers you’ll see.',
      'anonymityNotice': 'Nobody can see your contacts. Not even us.',
      'action': 'Import contacts',
    },
  },
  'postLoginFlow': {
    'contactsExplanation': {
      'title': 'Now, let’s find your friends!',
      'text':
        'Vexl is using your real-world social network - your friends and their friends. The more contacts you add, the more offers you’ll see.',
      'anonymizationCaption': 'Nobody can see your contacts. Not even us.',
    },
    'importContactsButton': 'Import contacts',
    'contactsList': {
      'addContact': 'Add contact {{number}} manually',
      'inputPlaceholder': 'Search or Add number',
      'nothingFound': {
        'title': 'No contact found. ',
        'text':
          'To add phone number directly, type it into a search bar (with country code prefix).',
      },
      'toAddCustomContact':
        'To add phone number directly type it into a search bar (with country code)',
    },
    'allowNotifications': {
      'title': 'Allow notification permissions',
      'text':
        'Enabling notifications lets you know when others accept your offers or when messages arrive.',
      'action': 'Allow',
      'cancel': 'Skip',
      'errors': {
        'permissionDenied':
          'Permissions not granted. You can allow them later in the system settings.',
        'unknownError': 'Unknown error while requesting permissions',
        'notAvailableOnEmulator': 'Notifications are not available on emulator',
      },
    },
  },
  'settings': {
    'yourReach': 'Your reach: {{number}} vexlers',
    'items': {
      'changeProfilePicture': 'Change profile picture',
      'editName': 'Edit name',
      'contactsImported': 'Contacts management',
      'xFriends': '{{number}} friends',
      'setPin': 'Set PIN',
      'faceId': 'Face ID',
      'czechCrown': 'Czech crown',
      'allowScreenshots': 'Allow Screenshots',
      'allowScreenshotsDescription':
        'Prevent users from taking screenshots of the chat',
      'termsAndPrivacy': 'Terms and Privacy',
      'faqs': 'FAQs',
      'reportIssue': 'Report issue',
      'inAppLogs': 'In-app logs',
      'requestKnownData': 'Request known data',
      'followUsOn': 'Follow us on',
      'twitter': 'Twitter',
      'twitterUrl': 'https://twitter.com/vexl',
      'readMoreOn': 'Read more on',
      'medium': 'Medium',
      'mediumUrl': 'https://blog.vexl.it',
      'learnMoreOn': 'Learn more on',
      'website': 'Vexl.it',
      'websiteUrl': 'https://vexl.it',
      'deleteAccount': 'Delete account',
      'supportEmail': 'support@vexl.it',
    },
    'noLogoutExplanation':
      "Can't find logout? There's no such thing.\nBut you can delete your account.",
    'support':
      'If you like Vexl, support it’s improvement by sending some bitcoin as donation!',
    'version': 'Vexl App version: {{version}}',
    'logoutDialog': {
      'title': 'Delete account?',
      'title2': 'You sure?',
      'description':
        'Are you sure you want to delete your account? This action cannot be undone',
    },
  },
  'offer': {
    'title': 'Offer',
    'cashOnly': 'Cash only',
    'onlineOnly': 'Online only',
    'upTo': 'Up to',
    'forSeller': 'For seller',
    'forBuyer': 'For buyer',
    'bank': 'Bank',
    'revolut': 'Online payment',
    'isSelling': 'is selling',
    'isBuying': 'is buying',
    'directFriend': 'Direct friend',
    'friendOfFriend': 'Friend of friend',
    'buy': 'Buy',
    'sell': 'Sell',
    'filterOffers': 'Filter offers',
    'filterActive': 'Filter active',
    'numberOfCommon': '{{number}} common',
    'offerNotFound':
      'Offer not found. It might have been deleted by the author',
    'inputPlaceholder': 'e.g. let’s trade my friend...',
    'sendRequest': 'Send Request',
    'report': {
      'areYouSureTitle': 'Report offer?',
      'areYouSureText':
        'Are you certain about reporting this offer? Once reported, it cannot be undone. Choose wisely.',
      'yes': 'Yes, report',
    },
    'goToChat': 'Go to chat',
    'requestStatus': {
      'requested':
        "You've requested a trade. We'll notify you once it's accepted.",
      'accepted': 'Your request was accepted.',
      'denied': 'Your request was declined.',
    },
    'listEmpty':
      'Your marketplace is just warming up. Come back in a couple of minutes! ',
    'emptyAction': 'Add new offer',
    'createOfferAndReachVexlers':
      'You reach {{reachNumber}} vexlers.\nAdd more contacts to increase the number of offers you see.',
  },
  'termsOfUse': {
    'termsOfUse': 'Terms of Use',
    'privacyPolicy': 'Privacy Policy',
    'dontHaveTime':
      'Don’t have a time to read all this? Take a look on Frequently Asked Questions.',
    'termsOfUseText': TosEn,
    'privacyPolicyText': PPEn,
  },
  'faqs': {
    'faqs': 'Frequently Asked Questions',
    'whatIsVexl': 'What is Vexl?',
    'vexlIsPlatform':
      'Vexl is a platform where you can trade Bitcoin within your real world social network - your friends and friends of their friends - while staying completely anonymous - if you wish.',
    'whoCanSeeMyContacts': 'Who can see my contacts?',
    'peopleWhomYouAllowToSee':
      "People whom you allow to see your identity can see the friends you have in common and that's all.",
    'howCanIRemainAnonymous':
      'How can I remain anonymous and still participate in Vexl? ',
    'byDefaultYouParticipateInTheNetwork':
      'By default, you participate in the network under your Vexl name and Vexl avatar that were given to you during the registration. You can only reveal your identity per a particular trade in our secure, end to end encrypted chat.',
    'howCanIMakeSure':
      'How can I make sure that the person I am talking to is the person I want to talk to?',
    'oneChallenge':
      'One challenge with truly anonymous communications systems like Vexl is that sometimes you do need to verify the identity of the person you’re talking to! In cases like these, it’s best to use a secure secondary channel of communication to confirm with the other person that you’re both who you say you are.',
    'howCanIEnsure':
      'How can I ensure that my communication and trades are private and encrypted? ',
    'vexlIsOpensource':
      'Vexl is open source - anyone can look for any backdoor or malicious intent. Also, here you can look at the report from an independent Security Audit .',
    'howCanYouEnsure': 'How can you ensure that my data is protected?',
    'vexlIsDesigned':
      'Vexl is designed to never collect or store any sensitive information. Vexl messages and other content cannot be accessed by us or other third parties because they are always end-to-end encrypted, private, and secure. Our Terms of Service and Privacy Policy are available below.',
    'howDoIContactVexl': 'How do I contact Vexl?',
    'youCanAlwaysReachOutToUs':
      'You can always reach out to us via email: support@vexl.it. For a private comms, you can also send us an e2ee mail. Or you can meet us during your next P2P trade! 😻',
  },
  'offerForm': {
    'myNewOffer': 'New offer',
    'iWantTo': 'I want to',
    'sellBitcoin': 'Sell Bitcoin',
    'buyBitcoin': 'Buy Bitcoin',
    'currency': 'Currency',
    'amountOfTransaction': {
      'amountOfTransaction': 'Amount',
      'pleaseSelectCurrencyFirst': 'Please select currency first',
      'pleaseSelectLocationFirst': 'Please select location first',
    },
    'premiumOrDiscount': {
      'premiumOrDiscount': 'Premium or discount',
      'youBuyForTheActualMarketPrice':
        'You buy for the actual market price. Play with the slider to sell faster or earn more.',
      'theOptimalPositionForMostPeople':
        'The optimal position for most people. You buy slightly faster, but a bit overpriced',
      'youBuyReallyFast': 'You buy quickly, but at much above the market price',
      'youBuyPrettyCheap':
        'You buy pretty cheap, but it can take slightly longer to find a seller',
      'youBuyVeryCheaply':
        'You buy very cheaply, but it can take a while to find seller',
      'buyFaster': 'Buy quickly',
      'buyCheaply': 'Buy cheaply',
      'youSellForTheActualMarketPrice':
        'You sell for the actual market price. Play with the slider to sell faster or earn more.',
      'youEarnBitMore': 'You earn a bit more, but it can take slightly longer.',
      'youWantToEarnFortune':
        'You want to earn a fortune, but it can take years to find a buyer.',
      'youSellSlightlyFaster':
        'You sell slightly faster, but a bit below market price',
      'youSellMuchFaster': 'You sell much faster, but far below market price',
      'youBuyBtcFor': 'You buy BTC for',
      'youSellBtcFor': 'You sell BTC for',
      'marketPrice': 'market price',
      'sellFaster': 'Sell faster',
      'earnMore': 'Earn more',
      'premiumOrDiscountExplained': 'Premium or discount explained',
      'influenceImpactOfYourSellOffer':
        'Influence the impact of your offer. Sell faster by adding a discount, or earn more by adding a premium to the Bitcoin market price.',
      'influenceImpactOfYourBuyOffer':
        'Influence the impact of your offer. Buy cheaply by adding a discount, or buy faster by adding a premium to the bitcoin market price.',
      'playWithItAndSee':
        'Play with it and see how it affects the interest of others.',
      'plus': '+',
      'minus': '-',
    },
    'buyCheaperByUsingDiscount':
      'Buy cheaper by using a discount or buy faster by adding a premium to the bitcoin market price',
    'sellFasterWithDiscount':
      'Sell faster with a discount or earn more by adding a premium to the bitcoin market price.',
    'location': {
      'location': 'Location',
      'meetingInPerson':
        'Meeting in person is safer. What to watch out for online?',
      'checkItOut': 'Check it out',
      'addCityOrDistrict': 'Add city, or district',
      'whatToWatchOutForOnline': 'What to watch out for online?',
      'moneySentByRandomPerson':
        'Money sent by a random person can be of criminal origin and traceable.',
      'neverSendCrypto': 'Never send bitcoin before receiving payment.',
      'alwaysVerifyTheName':
        'Always verify the name of the account holder you received the payment from with the declared identity of the counterparty.',
      'forwardTheAddress':
        'Forward the address in a secure manner and be sure to verify it through another secure channel.',
    },
    'inPerson': 'In person',
    'online': 'Online',
    'paymentMethod': {
      'paymentMethod': 'Payment method',
      'cash': 'Cash',
      'bank': 'Bank',
      'revolut': 'Online payment',
    },
    'network': {
      'network': 'Network',
      'lightning': 'Lightning',
      'theBestOption':
        'The best option for really small amounts. Usually super fast.',
      'onChain': 'On chain',
      'theBestFor': 'The best for larger amounts. Slower.',
    },
    'description': {
      'description': 'Description',
      'writeWhyPeopleShouldTake': 'Write why people should accept your offer.',
    },
    'friendLevel': {
      'friendLevel': 'Friend level',
      'firstDegree': '1st degree',
      'secondDegree': '2nd degree',
      'noVexlers': 'No vexlers',
      'reachVexlers': 'Reach {{count}} vexlers',
    },
    'publishOffer': 'Publish offer',
    'errorCreatingOffer': 'Error while creating offer',
    'errorSearchingForAvailableLocation':
      'Error when searching for available locations',
    'offerEncryption': {
      'encryptingYourOffer': 'Encrypting your offer ...',
      'dontShutDownTheApp':
        'Don’t shut down the app while encrypting. It can take several minutes.',
      'forVexlers': 'for {{count}} vexlers',
      'doneOfferPoster': 'Done! Offer posted.',
      'yourFriendsAndFriendsOfFriends':
        'Your friends and friends of their friends can now see your offer.',
      'anonymouslyDeliveredToVexlers':
        'Anonymously delivered to {{count}} vexlers',
    },
    'noVexlersFoundForYourOffer': 'No vexlers found for your offer',
    'errorLocationNotFilled': 'Please fill in offer location',
    'errorDescriptionNotFilled': 'Please fill in offer description',
  },
  'notifications': {
    'permissionsNotGranted': {
      'title': 'Permissions for notifications were not granted',
      'message': 'You can enable them in the settings',
      'openSettings': 'Open settings',
    },
    'errorWhileOpening': 'Error while opening notification',
  },
  'myOffers': {
    'addNewOffer': 'Add new offer',
    'activeOffers': '{{count}} active offers',
    'filterOffers': 'Filter offers',
    'errorWhileFetchingYourOffers': 'Error while fetching offers',
    'editOffer': 'Edit offer',
    'myOffer': 'My Offer',
    'offerAdded': 'Added {{date}}',
    'sortedByNewest': 'Sorted by newest',
    'sortedByOldest': 'Sorted by oldest',
  },
  'editOffer': {
    'editOffer': 'Edit offer',
    'active': 'Active',
    'inactive': 'Inactive',
    'saveChanges': 'Save changes',
    'offerUnableToChangeOfferActivation': 'Unable to change offer activation',
    'editingYourOffer': 'Editing your offer ...',
    'pleaseWait': 'Please wait',
    'offerEditSuccess': 'Offer edit success',
    'youCanCheckYourOffer': 'You can check your offer in your offers section',
    'errorEditingOffer': 'Error while editing offer',
    'errorOfferNotFound': 'Offer not found!',
    'offerDeleted': 'Offer deleted',
    'errorDeletingOffer': 'Error while deleting offer',
    'deleteOffer': 'Delete offer?',
    'deleteOfferDescription':
      'Are you sure you want to delete this offer? This action cannot be undone',
  },
  'filterOffers': {
    'filterResults': 'Filter results',
    'sorting': 'Sorting',
    'lowestFeeFirst': 'Lowest fee ',
    'highestFee': 'Highest fee',
    'newestOffer': 'Newest offer',
    'oldestOffer': 'Oldest offer',
    'lowestAmount': 'Lowest amount',
    'highestAmount': 'Highest amount',
    'selectSortingMethod': 'Select sorting method',
  },
  'messages': {
    'yourOffer': 'Your offer',
    'theirOffer': 'Their offer',
    'listTitle': 'Chats',
    'isBuying': 'is buying',
    'isSelling': 'is selling',
    'thisWillBeYourFirstInteraction':
      'This will be your first interaction with this offer.',
    'wellLetYouKnowOnceUserAccepts':
      'Request sent. We will let you know once other side has responded.',
    'messagePreviews': {
      'incoming': {
        'MESSAGE': '{{them}}: {{message}}',
        'REQUEST_REVEAL': '{{them}} requested identity reveal',
        'APPROVE_REVEAL': 'Identity revealed',
        'DISAPPROVE_REVEAL': 'Declined identity reveal',
        'REQUEST_MESSAGING': 'Reacted to your offer',
        'APPROVE_MESSAGING': 'Request was accepted',
        'DISAPPROVE_MESSAGING': 'Request was declined',
        'DELETE_CHAT': '{{them}} left the chat',
        'BLOCK_CHAT': '{{them}} Has blocked you',
        'OFFER_DELETED': '{{them}} has deleted his offer',
        'INBOX_DELETED': '{{them}} has deleted their inbox',
      },
      'outgoing': {
        'MESSAGE': 'Me: {{message}}',
        'REQUEST_REVEAL': 'You have requested identity reveal',
        'APPROVE_REVEAL': 'Identity revealed',
        'DISAPPROVE_REVEAL': 'Identity reveal declined',
        'REQUEST_MESSAGING': 'Request sent',
        'APPROVE_MESSAGING': 'You have approved messaging',
        'DISAPPROVE_MESSAGING': 'You have declined messaging request',
        'DELETE_CHAT': 'You have left the chat',
        'BLOCK_CHAT': 'User has been blocked',
        'OFFER_DELETED': 'You have deleted your offer',
        'INBOX_DELETED': 'You have deleted this inbox',
      },
    },
    'deleteChat': 'Delete Chat',
    'askToReveal': 'Ask to reveal identity',
    'blockUser': 'Block user',
    'sending': 'sending...',
    'unknownErrorWhileSending': 'Unknown error while sending message',
    'tapToResent': 'Tap to resend.',
    'deniedByMe': 'You denied messaging request request with {{name}}.',
    'deniedByThem': '{{name}} denied your messaging request.',
    'requestMessageWasDeleted': 'Request message was deleted',
    'typeSomething': 'Type something ...',
    'offerDeleted': 'Offer deleted',
    'leaveToo': 'Leave too?',
    'leaveChat': 'Leave chat?',
    'deleteChatQuestion': 'Delete chat?',
    'blockForewerQuestion': 'Block forever?',
    'yesBlock': 'Yes, block',
    'deleteChatExplanation1':
      'Are you done trading? Closing chat means that your conversation will be permanently deleted.',
    'deleteChatExplanation2':
      'This is definitive step, please confirm this action once again to delete the chat.',
    'blockChatExplanation1':
      'Do you really want to block this user? You will never be able to undo this action. Choose wisely.',
    'blockChatExplanation2':
      'Do you really want to block this user? You will never be able to undo this action. Choose wisely.',
    'chatEmpty': 'No chats yet',
    'chatEmptyExplanation': 'Start a conversation by requesting an offer',
    'seeOffers': 'See offers',
    'identityRevealRequestModal': {
      'title': 'Send reveal identity request?',
      'text':
        'By sending request you agree with revealing of your own identity too.',
      'send': 'Send request',
    },
    'identityRevealRespondModal': {
      'title': 'Do you want to reveal identity?',
      'text':
        'If you reveal your identity, you will see identity of your counterparty too.',
    },
    'identityAlreadyRequested':
      'Identity request was already sent in the conversation',
    'identityRevealRequest': 'Identity reveal request',
    'identityRevealed': 'Identity revealed',
    'identitySend': {
      'title': 'Reveal identity request sent',
      'subtitle': 'Waiting for response...',
    },
    'tapToReveal': 'Tap to reveal or decline',
    'letsRevealIdentities': "Let's reveal identities!",
    'reveal': 'Reveal',
    'themDeclined': '{{name}} declined',
    'youDeclined': 'You have declined',
  },
  'progressBar': {
    'ENCRYPTING_PRIVATE_PAYLOADS': '{{percentDone}}% done',
    'FETCHING_CONTACTS': '',
    'CONSTRUCTING_PRIVATE_PAYLOADS': 'Constructing private payloads',
    'CONSTRUCTING_PUBLIC_PAYLOAD': 'Constructing and encrypting public payload',
    'SENDING_OFFER_TO_NETWORK': 'Uploading offer',
    'DONE': 'Done',
  },
  'commonFriends': {
    'commonFriends': 'Common friends',
    'commonFriendsCount': '{{commonFriendsCount}} common friends',
  },
  'reportIssue': {
    'openInEmail': 'Open in e-mail',
    'somethingWentWrong': 'Something went wrong?',
    'feelFreeToGetInTouch': 'Feel free to get in touch with our support.',
    'predefinedBody': 'Hi! I am reporting an issue...',
  },
  'AppLogs': {
    'title': 'In app logs',
    'clear': 'Clear logs',
    'export': 'Export logs',
    'errorExporting': 'Error exporting logs',
    'warning':
      'Enabling app logs may cause app to be slower and will require more storage space.',
    'anonymizeAlert': {
      'title': 'Would you like to anonymize logs?',
      'text':
        'We can try to strip private keys and personal information from logs before exporting them. Always make sure to verify by yourself.',
    },
  },
  'MaintenanceScreen': {
    'title': 'Marketplace maintenance',
    'text': 'Vexl app is performing maintenance. Come back later, please.',
  },
  'ForceUpdateScreen': {
    'title': 'New version available',
    'text': 'Download the latest version of Vexl for proper app functionality.',
    'action': 'Update now',
  },
  'btcPriceChart': {
    'requestCouldNotBeProcessed': 'Request to obtain current BTC price failed',
  },
  'currency': {
    'currency': 'Currency',
    'czechCrown': 'Czech crown',
    'euro': 'Euro',
    'unitedStatesDollar': 'USD',
  },
  'deepLinks': {
    'importContacts': {
      'alert': {
        'title': 'Import contact',
        'text':
          'Do you want to import {{contactName}} with number {{contactNumber}}?',
      },
      'successAlert': {
        'title': 'Contact imported',
      },
    },
  },
  'qrCode': {
    'joinVexl': 'Join vexl',
  },
  'editName': {
    'editName': 'Edit name',
    'errorUserNameNotValid': 'User name is not valid',
  },
  'changeProfilePicture': {
    'changeProfilePicture': 'Change profile picture',
    'uploadNewPhoto': 'Upload new photo',
  },
}
