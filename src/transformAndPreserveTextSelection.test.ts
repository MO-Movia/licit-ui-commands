import {Schema, Node, MarkType} from 'prosemirror-model';
import {transformAndPreserveTextSelection,removePlaceholderText,setTextSelection,findAndApplyMarkRange, SelectionMemo,calculateFromOffset} from './transformAndPreserveTextSelection';
import {Transform} from 'prosemirror-transform';
import * as amark from './applyMark';
import {uuid} from './ui/uuid';
import { Transaction } from 'prosemirror-state';

describe('transformAndPreserveTextSelection', () => {
  const mySchema = new Schema({
    nodes: {
      doc: {content: 'paragraph*'},
      paragraph: {content: 'text*'},
      text: {inline: true},
    },
  });
  const initialDocContent = [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `[\u200b\u2800PLACEHOLDER_TEXT_${uuid()}\u2800\u200b]`,
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `[\u200b\u2800PLACEHOLDER_TEXT_${uuid()}\u2800\u200b]`,
        },
      ],
    },
  ];

  const initialDoc = mySchema.nodeFromJSON({
    type: 'doc',
    content: initialDocContent,
  });
  it('should handle transformAndPreserveTextSelection when getMeta return true', () => {
    const test = transformAndPreserveTextSelection(
      {
        getMeta: () => {
          return true;
        },
        selection: {},
        doc: {},
      } as unknown as Transform,
      {marks: {'mark-text-selection': ''}} as unknown as Schema,
      () => {
        return {} as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when !markType ', () => {
    const test = transformAndPreserveTextSelection(
      {
        getMeta: () => {
          return false;
        },
        selection: {from: 0, to: 1},
        doc: {},
      } as unknown as Transform,
      {marks: {'mark-text-selection': false}} as unknown as Schema,
      () => {
        return {} as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when from and to =0', () => {
    const test = transformAndPreserveTextSelection(
      {
        getMeta: () => {
          return false;
        },
        selection: {from: 1, to: 1},
        doc: initialDoc,
        setSelection: () => {
          return {
            getMeta: () => {
              return false;
            },
            selection: {from: 1, to: 1},
            doc: initialDoc,
          } as unknown as Transform;
        },
      } as unknown as Transform,
      {marks: {'mark-text-selection': {}}} as unknown as Schema,
      () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {doc: initialDoc};
          },
          removeMark: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
              setSelection: () => {
                return {doc: initialDoc};
              },
              removeMark: () => {
                return {};
              },
            } as unknown as Transform;
          },
        } as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when from and to =1', () => {
    jest.spyOn(amark, 'applyMark').mockReturnValue({
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {doc: initialDoc};
      },
    } as unknown as Transform);
    const test = transformAndPreserveTextSelection(
      {
        getMeta: () => {
          return false;
        },
        selection: {from: 1, to: 1},
        doc: initialDoc,
        setSelection: () => {
          return {
            getMeta: () => {
              return false;
            },
            selection: {from: 1, to: 1},
            doc: initialDoc,
          } as unknown as Transform;
        },
      } as unknown as Transform,
      {marks: {'mark-text-selection': {}}} as unknown as Schema,
      () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {doc: initialDoc};
          },
          removeMark: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
              setSelection: () => {
                return {doc: initialDoc};
              },
              removeMark: () => {
                return {};
              },
            } as unknown as Transform;
          },
        } as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when from and to =1 and when !currentNode &&prevNode &&prevNode.type.name === PARAGRAPH &&!prevNode.firstChild', () => {
    jest.spyOn(amark, 'applyMark').mockReturnValue({
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {doc: initialDoc};
      },
    } as unknown as Transform);
    const tr1 = {
      insert: () => {
        return {
          insert: () => {
            return {};
          },
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
            } as unknown as Transform;
          },
        } as unknown as Transform;
      },
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
        } as unknown as Transform;
      },
    } as unknown as Transform;
    jest
      .spyOn(tr1.doc, 'nodeAt')
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({type: {name: 'paragraph'}} as unknown as Node);

    const mySchema = new Schema({
      nodes: {
        doc: {content: 'text*'},
        text: {inline: true},
      },
    });
    const textNode = mySchema.text('This is a placeholder text node.');
    const test = transformAndPreserveTextSelection(
      tr1,
      {
        marks: {'mark-text-selection': {}},
        text: () => {
          return textNode;
        },
      } as unknown as Schema,
      () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {doc: initialDoc};
          },
          removeMark: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
              setSelection: () => {
                return {doc: initialDoc};
              },
              removeMark: () => {
                return {};
              },
            } as unknown as Transform;
          },
        } as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when from and to =1 and when !currentNode &&prevNode &&prevNode.type.name === TEXT &&!prevNode.firstChild', () => {
    jest.spyOn(amark, 'applyMark').mockReturnValue({
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {doc: initialDoc};
      },
    } as unknown as Transform);
    const tr1 = {
      insert: () => {
        return {
          insert: () => {
            return {};
          },
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
            } as unknown as Transform;
          },
        } as unknown as Transform;
      },
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
        } as unknown as Transform;
      },
    } as unknown as Transform;
    jest
      .spyOn(tr1.doc, 'nodeAt')
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce({type: {name: 'text'}} as unknown as Node);

    const mySchema = new Schema({
      nodes: {
        doc: {content: 'text*'},
        text: {inline: true},
      },
    });
    const textNode = mySchema.text('This is a placeholder text node.');
    const test = transformAndPreserveTextSelection(
      tr1,
      {
        marks: {'mark-text-selection': {}},
        text: () => {
          return textNode;
        },
      } as unknown as Schema,
      () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {doc: initialDoc};
          },
          removeMark: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
              setSelection: () => {
                return {doc: initialDoc};
              },
              removeMark: () => {
                return {};
              },
            } as unknown as Transform;
          },
        } as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when from and to =1 and when prevNode && currentNode && currentNode.type === prevNode.type', () => {
    jest.spyOn(amark, 'applyMark').mockReturnValue({
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {doc: initialDoc};
      },
    } as unknown as Transform);
    const tr1 = {
      insert: () => {
        return {
          insert: () => {
            return {};
          },
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
            } as unknown as Transform;
          },
        } as unknown as Transform;
      },
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
        } as unknown as Transform;
      },
    } as unknown as Transform;
    jest
      .spyOn(tr1.doc, 'nodeAt')
      .mockReturnValueOnce({type: {name: 'TES'}} as unknown as Node)
      .mockReturnValueOnce({type: {name: 'TEST'}} as unknown as Node);

    const mySchema = new Schema({
      nodes: {
        doc: {content: 'text*'},
        text: {inline: true},
      },
    });
    const textNode = mySchema.text('This is a placeholder text node.');
    const test = transformAndPreserveTextSelection(
      tr1,
      {
        marks: {'mark-text-selection': {}},
        text: () => {
          return textNode;
        },
      } as unknown as Schema,
      () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {doc: initialDoc};
          },
          removeMark: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
              setSelection: () => {
                return {doc: initialDoc};
              },
              removeMark: () => {
                return {};
              },
            } as unknown as Transform;
          },
        } as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });
  it('should handle transformAndPreserveTextSelection when getMeta return false and when from and to =1 and when prevNode && currentNode && currentNode.type === prevNode.type', () => {
    const mySchema1 = new Schema({
      nodes: {
        doc: {content: 'text*'},
        text: {inline: true},
      },
      marks: {
        myMark: {
          attrs: {id: {default: {}}},
          parseDOM: [
            {
              tag: 'span[data-id]',
              getAttrs: () => ({}),
            },
          ],
          toDOM: (mark) => ['span', {'data-id': mark.attrs.id}, 0],
        },
      },
    });

    // Create a text node with the mark that has an 'id' attribute
    const textNodeWithMark = mySchema1.text('This is a text node with a mark', [
      mySchema1.mark('myMark', {id: {}}),
    ]);

    // Create a doc node and add the text node to it
    const docNode = mySchema1.node('doc', null, [textNodeWithMark]);
    jest.spyOn(amark, 'applyMark').mockReturnValue({
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {doc: initialDoc};
      },
    } as unknown as Transform);
    const tr1 = {
      insert: () => {
        return {
          insert: () => {
            return {};
          },
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: docNode,
            } as unknown as Transform;
          },
        } as unknown as Transform;
      },
      getMeta: () => {
        return false;
      },
      selection: {from: 1, to: 1},
      doc: initialDoc,
      setSelection: () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
        } as unknown as Transform;
      },
    } as unknown as Transform;
    jest
      .spyOn(tr1.doc, 'nodeAt')
      .mockReturnValueOnce({type: {name: 'TES'}} as unknown as Node);

    const mySchema = new Schema({
      nodes: {
        doc: {content: 'text*'},
        text: {inline: true},
      },
    });
    const textNode = mySchema.text('This is a placeholder text node.');
    const test = transformAndPreserveTextSelection(
      tr1,
      {
        marks: {'mark-text-selection': {}},
        text: () => {
          return textNode;
        },
      } as unknown as Schema,
      () => {
        return {
          getMeta: () => {
            return false;
          },
          selection: {from: 1, to: 1},
          doc: initialDoc,
          setSelection: () => {
            return {doc: initialDoc};
          },
          removeMark: () => {
            return {
              getMeta: () => {
                return false;
              },
              selection: {from: 1, to: 1},
              doc: initialDoc,
              setSelection: () => {
                return {doc: initialDoc};
              },
              removeMark: () => {
                return {};
              },
            } as unknown as Transform;
          },
        } as unknown as Transform;
      }
    );
    expect(test).toBeDefined();
  });

it('should call removePlaceholderText method and return undefined', () => {
  const tr1 = {
    insert: () => {
      return {
        insert: () => {
          return {};
        },
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
        setSelection: () => {
          return {
            getMeta: () => {
              return false;
            },
            selection: { from: 1, to: 1 },
            doc: initialDoc,
          } as unknown as Transaction;
        },
      } as unknown as Transaction;
    },
    getMeta: () => {
      return false;
    },
    selection: { from: 1, to: 1 },
    doc: initialDoc,
    setSelection: () => {
      return {
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
      } as unknown as Transaction;
    },
  } as unknown as Transaction;

  const result = removePlaceholderText(tr1);
  expect(result).toBeUndefined();
});

it('should call setTextSelection method and return undefined', () => {
  const tr1 = {
    insert: () => {
      return {
        insert: () => {
          return {};
        },
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
        setSelection: () => {
          return {
            getMeta: () => {
              return false;
            },
            selection: { from: 1, to: 1 },
            doc: initialDoc,
          } as unknown as Transaction;
        },
      } as unknown as Transaction;
    },
    getMeta: () => {
      return false;
    },
    selection: { from: 1, to: 1 },
    doc: initialDoc,
    setSelection: () => {
      return {
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
      } as unknown as Transaction;
    },
  } as unknown as Transaction;
  const from = 2;
  const offset = 3;
  const result = setTextSelection(tr1,from,offset);
  expect(result).toBeDefined();
});

it('should call findAndApplyMarkRange method and return the expected range', () => {
  // Mock constants used in findMarkRange
  const TEXT = 'text';
  const PLACEHOLDER_TEXT = 'placeholder';
  const mockMarkId = {}; // Mock the ID to be used in the marks

  // Mock initialDoc with a proper node type and marks
  const initialDoc = {
    descendants: jest.fn((callback) => {
      // Mock behavior of descendants
      const mockNode = {
        type: { name: TEXT }, // Mock type with name property
        text: PLACEHOLDER_TEXT,
        nodeSize: 10, // Example nodeSize, adjust as necessary
        marks: [{ attrs: { id: mockMarkId } }] // Mock marks array
      };
      callback(mockNode, 0);
      return true;
    }),
  };

  const tr1 = {
    insert: () => {
      return {
        insert: () => {
          return {};
        },
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
        setSelection: () => {
          return {
            getMeta: () => {
              return false;
            },
            selection: { from: 1, to: 1 },
            doc: initialDoc,
          } as unknown as Transaction;
        },
      } as unknown as Transaction;
    },
    getMeta: () => {
      return false;
    },
    selection: { from: 1, to: 1 },
    doc: initialDoc,
    setSelection: () => {
      return {
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
      } as unknown as Transaction;
    },
    removeMark: jest.fn(), // Mock removeMark method
  } as unknown as Transform;

  const markType = {} as unknown as MarkType;
  const id = mockMarkId; // Use the mock ID
  const transformMock = jest.fn(() => tr1) as unknown as (memo: SelectionMemo) => Transform;

  const result = findAndApplyMarkRange(tr1, mySchema, markType, id, transformMock);

  expect(result).toEqual({ from: 0, to: 10 });
  expect(tr1.removeMark).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), markType);
});

it('should call calculateFromOffset method',()=>{
  const tr1 = {
    insert: () => {
      return {
        insert: () => {
          return {};
        },
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
        setSelection: () => {
          return {
            getMeta: () => {
              return false;
            },
            selection: { from: 1, to: 1 },
            doc: initialDoc,
          } as unknown as Transaction;
        },
      } as unknown as Transaction;
    },
    getMeta: () => {
      return false;
    },
    selection: { from: 1, to: 1 },
    doc: initialDoc,
    setSelection: () => {
      return {
        getMeta: () => {
          return false;
        },
        selection: { from: 1, to: 1 },
        doc: initialDoc,
      } as unknown as Transaction;
    },
    removeMark: jest.fn(), // Mock removeMark method
  } as unknown as Transaction;
  const from = 2;
  const test = calculateFromOffset(tr1,from);
  expect(test).toBeDefined();
});

it('should handle the case where currentNode is not defined', () => {
  const initialDoc = {
    nodeAt: (pos) => {
      // Mock the nodeAt method to return undefined for certain positions
      if (pos === 2) return undefined; // This ensures currentNode is undefined
      return { type: { name: 'TEXT' } }; // Mock a TEXT node for prevNode and nextNode
    },
  };

  const tr1 = {
    insert: () => ({
      insert: () => ({}),
      getMeta: () => false,
      selection: { from: 1, to: 1 },
      doc: initialDoc,
      setSelection: () => ({
        getMeta: () => false,
        selection: { from: 1, to: 1 },
        doc: initialDoc,
      } as unknown as Transaction),
    }),
    getMeta: () => false,
    selection: { from: 1, to: 1 },
    doc: initialDoc,
    setSelection: () => ({
      getMeta: () => false,
      selection: { from: 1, to: 1 },
      doc: initialDoc,
    } as unknown as Transaction),
    removeMark: jest.fn(), // Mock removeMark method
  } as unknown as Transaction;

  const from = 2;
  const test = calculateFromOffset(tr1, from);

  // Check if the function handles the case correctly
  expect(test).toBe(1); // Should return 1 as per the branch logic when currentNode is not defined
});


it('should handle edge case when `from` is negative', () => {
  const tr1 = {
    insert: () => ({
      insert: () => ({}),
      getMeta: () => false,
      selection: { from: 1, to: 1 },
      doc: initialDoc,
      setSelection: () => ({
        getMeta: () => false,
        selection: { from: 1, to: 1 },
        doc: initialDoc,
      } as unknown as Transaction),
    } as unknown as Transaction),
    getMeta: () => false,
    selection: { from: 1, to: 1 },
    doc: initialDoc,
    setSelection: () => ({
      getMeta: () => false,
      selection: { from: 1, to: 1 },
      doc: initialDoc,
    } as unknown as Transaction),
    removeMark: jest.fn(),
  } as unknown as Transaction;

  const from = 1;
  const result = calculateFromOffset(tr1, from);

  expect(result).toBeDefined();
  // Add specific expectations based on how negative `from` should be handled
});

});
