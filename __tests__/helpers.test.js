const { normaliseFieldName, processNode } = require("../helpers/");

describe("Helpers:", () => {
  it("should normalize fieldname", () => {
    expect(normaliseFieldName("products/categories")).toEqual(
      "productsCategories"
    );
  });

  it("should return correct data from processNode", () => {
    const __type = "wcProducts";
    const id = 1234;
    const cat_id = 23;

    const nodeWithOutType = {
      id,
      categories: [{ id: cat_id }],
      wordpress_id: id,
    };
    const node = {
      __type,
      ...nodeWithOutType,
    };
    const contentDigest = "digest_string";
    const createContentDigest = jest.fn(() => contentDigest);
    const processNodeResult = processNode(createContentDigest, node);

    expect(createContentDigest).toBeCalled();
    expect(processNodeResult).toEqual({
      ...nodeWithOutType,
      parent: null,
      children: [],
      internal: {
        type: __type,
        contentDigest,
      },
    });

    expect(processNodeResult).toMatchSnapshot({
      id: id,
      categories: [
        {
          id: cat_id,
          wordpress_id: cat_id,
        },
      ],
      wordpress_id: id,
      parent: expect.any(Object),
      children: expect.any(Array),
      internal: {
        type: __type,
        contentDigest: contentDigest,
      },
    });
  });
});
