/* AIGC */
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe('updateCharCount', () => {
  let dom;
  let document;
  let postContent;
  let charCount;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><div id="postContent"></div><span id="charCount"></span>`);
    document = dom.window.document;
    postContent = document.getElementById('postContent');
    charCount = document.getElementById('charCount');
  });

  it('should update char count correctly when input is less than 5000 characters', () => {
    postContent.textContent = 'a'.repeat(4999);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('4999');
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should update char count correctly when input is exactly 5000 characters', () => {
    postContent.textContent = 'a'.repeat(5000);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('5000');
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should add red class when input exceeds 5000 characters', () => {
    postContent.textContent = 'a'.repeat(5001);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('5001');
    expect(charCount.classList.contains('text-red-500')).toBeTruthy();
  });

  it('should remove red class when input goes below 5000 characters after exceeding', () => {
    postContent.textContent = 'a'.repeat(5001);
    require('../post.html').updateCharCount();
    expect(charCount.classList.contains('text-red-500')).toBeTruthy();

    postContent.textContent = 'a'.repeat(4999);
    require('../post.html').updateCharCount();
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should handle null input gracefully', () => {
    postContent = null;
    expect(() => require('../post.html').updateCharCount()).not.toThrow();
  });

  it('should handle undefined input gracefully', () => {
    postContent = undefined;
    expect(() => require('../post.html').updateCharCount()).not.toThrow();
  });
});

describe('updateCharCount', () => {
  let dom;
  let document;
  let postContent;
  let charCount;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><div id="postContent"></div><span id="charCount"></span>`);
    document = dom.window.document;
    postContent = document.getElementById('postContent');
    charCount = document.getElementById('charCount');
  });

  it('should update char count correctly when input is less than 5000 characters', () => {
    postContent.textContent = 'a'.repeat(4999);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('4999');
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should update char count correctly when input is exactly 5000 characters', () => {
    postContent.textContent = 'a'.repeat(5000);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('5000');
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should add red class when input exceeds 5000 characters', () => {
    postContent.textContent = 'a'.repeat(5001);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('5001');
    expect(charCount.classList.contains('text-red-500')).toBeTruthy();
  });

  it('should remove red class when input goes below 5000 characters after exceeding', () => {
    postContent.textContent = 'a'.repeat(5001);
    require('../post.html').updateCharCount();
    expect(charCount.classList.contains('text-red-500')).toBeTruthy();

    postContent.textContent = 'a'.repeat(4999);
    require('../post.html').updateCharCount();
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should handle null input gracefully', () => {
    postContent = null;
    expect(() => require('../post.html').updateCharCount()).not.toThrow();
  });

  it('should handle undefined input gracefully', () => {
    postContent = undefined;
    expect(() => require('../post.html').updateCharCount()).not.toThrow();
  });

  it('should handle empty string input correctly', () => {
    postContent.textContent = '';
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('0');
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should handle input with HTML tags correctly', () => {
    postContent.innerHTML = '<p>这是一个段落</p>';
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('<p>这是一个段落</p>'.length.toString());
    expect(charCount.classList.contains('text-red-500')).toBeFalsy();
  });

  it('should handle very long input correctly', () => {
    postContent.textContent = 'a'.repeat(10000);
    require('../post.html').updateCharCount();
    expect(charCount.textContent).toBe('10000');
    expect(charCount.classList.contains('text-red-500')).toBeTruthy();
  });
});